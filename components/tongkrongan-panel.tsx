import { Languages, Quote, Target } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { InlineText } from "@/components/lesson-blocks";
import { getTongkrongan } from "@/lib/tongkrongan";

/**
 * "Versi Tongkrongan" — penjelasan ulang Bahasa Indonesia santai.
 * Ini panel utama buat paham konsep; teks Inggris aslinya ada di panel terpisah
 * biar istilah ujian tetap kekunci.
 */
export function TongkronganPanel({ num }: { num: string }) {
  const t = getTongkrongan(num);
  if (!t) return null;

  return (
    <Card className="mb-8 overflow-hidden border-primary/30">
      <CardHeader className="border-b border-primary/15 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent pb-4">
        <CardTitle className="flex flex-wrap items-center gap-2 text-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Languages className="h-5 w-5" />
          </span>
          Versi Tongkrongan
          <Badge variant="secondary">🇮🇩 Bahasa Indonesia</Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Konsepnya dulu dijelasin santai di sini. Kalau udah nyantol, baru cek
          istilah &amp; teks aslinya di bawah.
        </p>
      </CardHeader>

      <CardContent className="pt-5">
        {/* analogi */}
        <div className="rounded-xl border border-primary/25 bg-primary/5 p-4">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Quote className="h-3.5 w-3.5" /> Bayangin gini
          </p>
          <p className="text-[15px] font-medium leading-7">
            <InlineText text={t.analogi} />
          </p>
        </div>

        {/* poin utama */}
        <div className="mt-5 space-y-3.5">
          {t.poin.map((p, i) => (
            <div key={i} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 font-mono text-xs font-bold text-primary">
                {i + 1}
              </span>
              <p className="text-[15px] leading-7 text-foreground/90">
                <InlineText text={p} />
              </p>
            </div>
          ))}
        </div>

        {/* istilah kunci */}
        <div className="mt-6 rounded-xl border bg-muted/40 p-4">
          <p className="mb-3 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-primary">
            <Target className="h-3.5 w-3.5" /> Istilah kunci (dihafal apa adanya,
            ujiannya pakai ini)
          </p>
          <dl className="space-y-2.5">
            {t.istilah.map((it) => (
              <div key={it.term} className="text-sm leading-6">
                <dt className="inline font-mono text-[13px] font-semibold text-primary">
                  <code className="rounded-md bg-primary/10 px-1.5 py-0.5">{it.term}</code>
                </dt>
                <dd className="mt-0.5 text-muted-foreground">
                  <InlineText text={it.arti} />
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* aturan keputusan */}
        <div className="mt-5 flex items-start gap-3 rounded-xl border border-success/30 bg-success/10 p-4">
          <span className="text-lg">🧷</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-success">
              Hafalin satu baris ini
            </p>
            <p className="mt-1 text-sm font-semibold leading-6">
              <InlineText text={t.catat} />
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
