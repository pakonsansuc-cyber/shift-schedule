import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Parses a schedule image into assignments using Claude vision.
// Requires ANTHROPIC_API_KEY (server-side). Admin only.

interface ScanBody {
  image: string; // data URL, e.g. "data:image/png;base64,...."
  monthHint?: string; // "YYYY-MM"
}

interface ParsedAssignment {
  date: string;
  memberId: string;
  shift: "wfh" | "tdpk" | "night";
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า AI — เพิ่ม ANTHROPIC_API_KEY ใน .env.local" },
      { status: 503 },
    );
  }

  // Must be a signed-in admin (writes happen after confirmation, but gate here too).
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "ต้องเข้าสู่ระบบ" }, { status: 401 });
  }
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    return NextResponse.json({ error: "เฉพาะแอดมิน" }, { status: 403 });
  }

  let body: ScanBody;
  try {
    body = (await request.json()) as ScanBody;
  } catch {
    return NextResponse.json({ error: "คำขอไม่ถูกต้อง" }, { status: 400 });
  }

  const m = /^data:(image\/[a-zA-Z.+-]+);base64,(.+)$/.exec(body.image ?? "");
  if (!m) {
    return NextResponse.json({ error: "รูปภาพไม่ถูกต้อง" }, { status: 400 });
  }
  const [, mediaType, base64] = m;

  // Give the model the valid roster + shift vocabulary to map against.
  const [{ data: members }, { data: shiftTypes }] = await Promise.all([
    supabase.from("members").select("id, name"),
    supabase.from("shift_types").select("id, short, label"),
  ]);

  const model = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-5-5";
  const prompt = [
    "You extract a work shift schedule from an image into JSON.",
    "Valid team members (use their exact id):",
    JSON.stringify(members ?? []),
    "Valid shift types (use the id: wfh=morning WFH, tdpk=morning office, night):",
    JSON.stringify(shiftTypes ?? []),
    body.monthHint
      ? `The schedule is for month ${body.monthHint}. Output dates as YYYY-MM-DD in that month.`
      : "Output dates as YYYY-MM-DD.",
    "Return ONLY a JSON object: {\"assignments\":[{\"date\":\"YYYY-MM-DD\",\"memberId\":\"<id>\",\"shift\":\"wfh|tdpk|night\"}]}.",
    "Map names/nicknames in the image to the member ids above. Skip anything you cannot map confidently.",
  ].join("\n");

  let aiText: string;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: { type: "base64", media_type: mediaType, data: base64 },
              },
              { type: "text", text: prompt },
            ],
          },
        ],
      }),
    });
    if (!res.ok) {
      const detail = await res.text();
      return NextResponse.json(
        { error: `เรียก AI ไม่สำเร็จ (${res.status})`, detail },
        { status: 502 },
      );
    }
    const data = await res.json();
    aiText =
      data?.content?.find((c: { type: string }) => c.type === "text")?.text ??
      "";
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "เรียก AI ไม่สำเร็จ" },
      { status: 502 },
    );
  }

  // Extract the JSON object from the model's reply.
  const jsonMatch = aiText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    return NextResponse.json(
      { error: "AI ตอบกลับไม่เป็น JSON", raw: aiText.slice(0, 500) },
      { status: 502 },
    );
  }

  let parsed: { assignments?: ParsedAssignment[] };
  try {
    parsed = JSON.parse(jsonMatch[0]);
  } catch {
    return NextResponse.json({ error: "อ่าน JSON จาก AI ไม่ได้" }, { status: 502 });
  }

  const validIds = new Set((members ?? []).map((x) => x.id));
  const assignments = (parsed.assignments ?? []).filter(
    (a) =>
      /^\d{4}-\d{2}-\d{2}$/.test(a.date) &&
      validIds.has(a.memberId) &&
      ["wfh", "tdpk", "night"].includes(a.shift),
  );

  return NextResponse.json({ assignments });
}
