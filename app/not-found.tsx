import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[50vh] flex-col items-center justify-center py-20 text-center">
      <span className="text-6xl">🧐</span>
      <h1 className="mt-5 font-display text-3xl font-black">404 — Nggak ketemu, bre</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        Halaman yang lu cari nggak ada. Mungkin salah alamat, atau modulnya belum dibikin.
      </p>
      <Button asChild className="mt-6">
        <Link href="/learn">Kembali ke daftar domain</Link>
      </Button>
    </div>
  );
}
