import { createClient } from "npm:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  Deno.env.get("VAPID_SUBJECT")!,
  Deno.env.get("VAPID_PUBLIC")!,
  Deno.env.get("VAPID_PRIVATE")!,
);
const sb = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

const NEW_DECK: Record<string, string> = {
  en: "New deck added",
  id: "Dek baru ditambahkan",
  vi: "Đã thêm bộ từ mới",
  ru: "Добавлена новая колода",
  zh: "新增了词库",
};

Deno.serve(async (req) => {
  if (req.headers.get("x-webhook-secret") !== Deno.env.get("WEBHOOK_SECRET")) {
    return new Response("forbidden", { status: 403 });
  }
  const { record: n } = await req.json();
  const { data: subs } = await sb.from("push_subscriptions").select("*").eq("user_id", n.user_id);
  await Promise.all((subs ?? []).map(async (s: any) => {
    const lang = s.lang in NEW_DECK ? s.lang : "en";
    const alert = n.kind === "alert";
    const title = alert ? (n.title || n.payload?.class || "Zhongwenfy") : NEW_DECK[lang];
    const body = alert ? n.body : `${n.payload?.class ?? ""}: ${(n.payload?.decks ?? []).join(", ")}`;
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh_key, auth: s.auth_key } },
        JSON.stringify({ title, body, tag: n.id, class_id: n.payload?.class_id ?? null }),
        { TTL: 86400 },
      );
    } catch (e: any) {
      if (e?.statusCode === 404 || e?.statusCode === 410) {
        await sb.from("push_subscriptions").delete().eq("endpoint", s.endpoint);
      }
    }
  }));
  return new Response("ok");
});
