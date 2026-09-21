/**
 * annotations.ts
 * "Inti Permasalahan" — TL;DR bahasa tongkrongan buat tiap modul.
 * Materi asli tetap English (ujian aslinya English), tapi yang mau dikejar
 * kalimat pertama setiap halaman harusnya langsung kebaca dengan bahasa santai.
 */
export interface Annotation {
  tldr: string;
}

export const annotations: Record<string, Annotation> = {
  "1.1": {
    tldr:
      "Agent itu kelakunya kayak lo nanya ke orang: dia bakal terus kerja selama dia minta tool (stop_reason = tool_use), dan baru berhenti kalau dia bilang udah selesai (end_turn). Jangan cek kata-kata 'gue udah beres' atau pakai hitungan 'maksimal 10 putaran' — sinyal yang bener itu stop_reason. Dan pas dia minta tool, hasil tool WAJIB dikasih balik ke dia, kalau nggak dia ngambek nggak bisa lanjut.",
  },
  "1.2": {
    tldr:
      "Orkestrasi multi-agent itu kayak grup music yang ada manajernya (coordinator). Semua komunikasi WAJIB lewat manajer — subagent nggak pernah NGP ke sesama subagent. Subagent juga beneran lupa-lupaan: nggak bawa history manajer, nggak ada memori bareng. Kalau output hasilnya bolong cakupannya, jangan salahin subagent — hampir selalu koordinatornya yang nggak nge-decompose topik dengan luas.",
  },
  "1.3": {
    tldr:
      "Ini soal kabeling antar agent. Coordinator manggil subagent pakai Task tool (nama barunya Agent), dan WAJIB ada di allowedTools — kalau nggak, subagent nggak bisa dipanggil sama sekali. Kirim konteks harus lengkap plus metadata sumbernya (URL, nama dokumen, halaman) — kalau cuma kirim isi doang, hasil akhirnya nggak bisa nyitir. Task yang independen harus di-spawn paralel biar nggak ngantuk nunggu satu-satu.",
  },
  "1.4": {
    tldr:
      "Ada dua cara ngatur agent: nasihatin lewat prompt (90-95% sukses) atau nagih lewat kode (100% sukses). Semua yang nyangkut duit, keamanan, atau compliance — pakai kode: prerequisite gate yang fisik ngeblok tool sampai syaratnya kelar. Dan pas nyerahin ke manusia (handoff), ringkasan harus berdiri sendiri — manusia nggak bisa scroll chat lama.",
  },
  "1.5": {
    tldr:
      "Hook itu 'satpam' yang jalan di titik-titik tertentu: PreToolUse bisa ngeblok tool sebelum jalan, PostToolUse ngecek hasil setelah jalan. Buat rule yang harus 100% (AML, duit, regulasi), PreToolUse adalah jawabannya — bukan prompt, bukan juga nge-flag belakangan. Exit code 2 = nge-gas agent balik kerja lagi.",
  },
  "1.6": {
    tldr:
      "Kalau agent dikasih banyak file sekaligus, perhatiannya jadi tipis kayak wifi kantin — file awal dapet review detail, file terakhir banyak yang lolos bug. Solusinya: pecah jadi pass lokal per file + pass terpisah buat cek silang antar file. Bukan ganti model lebih gede, bukan juga maksa lewat prompt.",
  },
  "1.7": {
    tldr:
      "Session lama itu kayak temen yang masih nyimpen info basi — abis lu ubah kode, dia masih kasih saran yang udah nggak relevan. Solusinya: mulai session baru, tapi kasih ringkasan temuan yang masih relevan + kasih tahu file mana yang berubah, jadi dia re-analisis yang perlu aja. Resume itu lanjut yang lama, fork itu nge-branch — beda hal.",
  },
  "2.1": {
    tldr:
      "Tool description itu 'menu resto'-nya LLM — dari sinilah dia milih tool. Kalau dua tool deskripsinya mirip dan dangkal, agent bakal sering salah pilih. Fix pertama yang paling murah dan paling ampuh: tulis deskripsi yang lengkap (format input, contoh, boundary 'jangan pakai untuk X'). Bukan few-shot, bukan routing classifier.",
  },
  "2.2": {
    tldr:
      "Error harus dideskripsiin dengan rapi: transient (coba lagi nanti), validation (input lo yang salah, betulin dulu), business (kebijakan larang, cari jalur lain), permission (akses kurang). Yang paling sering kejureum: 'hasil kosong' itu bukan error — query sukses, datanya emang nggak ada. Salah bedain ini = agent nggak berguna nge-retry + eskalasi ke manusia sia-sia.",
  },
  "2.3": {
    tldr:
      "Tool enaknya dikasih ke yang kerjaannya paling sering pakai tool itu. Kalau subagent tiap ngecek fakta kecil harus bolak-balik ke coordinator (2-3 round trip, latency +40%), kasih dia tool kecil yang scoped buat lookup sederhana. Verifikasi yang kompleks tetep lewat coordinator.",
  },
  "2.4": {
    tldr:
      "Mau integrate service populer kayak Jira? Jangan langsung bangun MCP server sendiri — cari dulu server community yang udah ada. Cuma kalau kebutuhan timnya beneran spesifik dan nggak ke-cover, baru build custom. Prinsip guide: effort kecil yang ngefek dulu.",
  },
  "2.5": {
    tldr:
      "Tool bawaan punya peran masing-masing: Grep buat nyari ISI file, Glob buat nyari berdasarkan NAMA/pattern file, Bash buat command shell, Read buat baca file. Pas butuh 'cari pemanggil fungsi lalu cari test file-nya': Grep dulu (nangkep caller, termasuk test yang import langsung), baru Glob pattern test file di sebelahnya.",
  },
  "3.1": {
    tldr:
      "CLAUDE.md itu ada tiga tingkat: user (~/.claude/), project (di repo), dan subdirektori. Kalau dua developer di repo yang sama tapi perilaku Claude-nya beda, hampir pasti konvensinya numpang di CLAUDE.md user-level punya si developer pertama — cuma dia yang ke-load. Konvensi tim harusnya di project level.",
  },
  "3.2": {
    tldr:
      "Slash command/skill yang mau di-share ke tim = taruh di .claude/commands/ atau .claude/skills/ di repo (ikut ke-clone semua orang). Yang personal = ~/.claude/. Skill yang outputnya panjang dan nggak mau numpuk di chat utama pakai context: fork biar punya dunia sendiri.",
  },
  "3.3": {
    tldr:
      "Kalau aturan cuma berlaku buat file tertentu (misal semua file test), jangan numpuk di root CLAUDE.md (ke-load terus ngebuang token) dan jangan copy-paste CLAUDE.md ke 50 direktori. Pakai satu rule file di .claude/rules/ dengan frontmatter paths berisi glob — ke-load cuma pas nyentuh file yang match.",
  },
  "3.4": {
    tldr:
      "Plan mode = mikir dulu sebelum ngerubah kode (buat refactor gede, migrasi banyak file). Direct execution = langsung gas (buat fix jelas, scope kecil, ada stack trace). Ujian suka kasih 3 skenario campuran — sesuaikan mode sama kompleksitas & risikonya, bukan 'semua pakai plan' atau 'semua langsung'.",
  },
  "3.5": {
    tldr:
      "Kadang lo deskripsiin transformasi pake prosa dan Claude ngerti tiap kali beda. Tangga perbaikannya: (1) kasih 2-3 contoh konkret input→output, (2) bikin test suite dan iterate dari kegagalan test, (3) interview pattern biar Claude yang nanya balik. Mulai dari yang paling atas — contoh konkret.",
  },
  "3.6": {
    tldr:
      "Jalanin Claude Code di CI itu beda dari di terminal: harusnya pakai flag -p (print mode) biar dia nggak nunggu input manusia. Kalau job CI hang, 9 dari 10 itu karena dia nunggu input interaktif — bukan bug, itu feature yang salah mode.",
  },
  "4.1": {
    tldr:
      "Prompt yang bilang 'cuman laporin yang yakin' itu terlalu vague — nggak ada batas keputusan yang bisa dipakai model. Dan hati-hati: satu kategori review yang banyak false positive bisa bikin developer ngopecat SEMUA laporan, termasuk security yang beneran penting. Fix: matiin kategori noisy selagi kriterianya dibenerin dengan contoh konkret.",
  },
  "4.2": {
    tldr:
      "Kadang model jago ngekstrak data dari tabel tapi gagal pas info yang sama ada di paragraf cerita. Instruksinya udah lengkap? Masalahnya bukan instruksi, tapi pola — kasih few-shot: contoh yang dikorek dari KEDUA format. Model belajar dari contoh lebih gampang daripada dari deskripsi.",
  },
  "4.3": {
    tldr:
      "Tool_use + JSON schema itu cara paling andal buat output terstruktur. Tapi hati-hati: kalau field wajib semua padahal dokumennya nggak punya info itu, model DIPAKSA ngarang — tanggal & nominal ngarang itu khasnya. Solusinya: field yang mungkin nggak ada dibikin optional/nullable, jujur itu kunci.",
  },
  "4.4": {
    tldr:
      "Retry itu harus cerdas, bukan lotere. Ada dua jenis gagal: (1) model salah hitung tapi data ada — kasih feedback errornya spesifik, re-extract bisa sukses; (2) data beneran nggak ada di dokumen — retry nggak mungkin sukses, model bakal ngarang. Jenis 1 → retry, jenis 2 → langsung human review.",
  },
  "4.5": {
    tldr:
      "Message Batches API itu 50% lebih murah tapi hasilnya butuh waktu (jam-an). Aturannya simpel: kerjaan yang nggak keburu (laporan semalam) → batch. Kerjaan yang ngeblok orang (pre-merge check) → real-time. Jangan serakah pake batch buat semua — latency itungannya juga.",
  },
  "4.6": {
    tldr:
      "Review 14 file sekaligus = perhatian menipis, komentar dangkal, bahkan kontradiktif. Solusi: pass lokal per file buat depth konsisten + pass terpisah buat cross-file integration (data flow, konsistensi antar file). Bukan model lebih gede, bukan juga nyerahin ke developer buat pecahin PR.",
  },
  "5.1": {
    tldr:
      "Context window itu keterbatasan beneran, dan summarization bakal 'makan' detail — termasuk angka penting kayak $247.83. Solusinya: fakta transaksional (amount, tanggal, order #) di-extract ke 'case facts block' yang dimasukin di tiap prompt, DI LUAR history yang di-summarize. Fakta kritikal nggak boleh ikut kompresi.",
  },
  "5.2": {
    tldr:
      "Eskalasi itu harus masuk akal: kasus gampang (kerusakan → penggantian) resolve sendiri, kasus ribet (exception kebijakan) eskalasi. Kalau kebalik (gampang di-eskalasi, ribet di-handle sendiri) — itu hasil prompt yang vague. Kasih kriteria eksplisit + contoh (few-shot) biar model tahu batasnya di mana.",
  },
  "5.3": {
    tldr:
      "Error di sistem multi-agent itu harus di-propagate dengan KONTEKS: jenis gagalnya apa, query yang dicoba apa, hasil parsial apa yang udah didapet, opsi pemulihan apa yang ada. Nggak boleh senyap-senyap dibuang (koordinator buta) dan nggak boleh over-kill (bantai seluruh workflow karena satu timeout). Recovery lokal dulu, propagate yang beneran macet.",
  },
  "5.4": {
    tldr:
      "Pas agent explore codebase lama-lama, dia mulai 'mengarang' pola umum karena detail awal memudar dari konteksnya. Solusinya: bikin dia nyatet temuan penting (nama class, dependency chain) ke file scratchpad yang bisa dia baca balik. Memori eksternal > andelin memori internal yang meyakinkan tapi rapuh.",
  },
  "5.5": {
    tldr:
      "Angka akurasi agregat bisa jadi topeng: 97% rata-rata bisa sembunyiin tipe dokumen tertentu yang akurasinya cuma 80-an. Dan confidence score model itu bukan probabilitas error yang beneran — harus dikalibrasi dulu terhadap dataset berlabel sebelum dipakai buat memutuskan siapa yang boleh lewat tanpa review manusia.",
  },
  "5.6": {
    tldr:
      "Dua sumber credible yang beda angka itu NORMAL di riset. Yang salah: sistem diam-diam milih satu (yang terbaru) tanpa bilang ada konflik. Yang bener: tampilkan KEDUA nilai plus atribusi sumber & tanggal publikasinya — transparansi (provenance) itu tugas sistem, interpretasinya biar pembaca.",
  },
};
