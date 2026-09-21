/**
 * tongkrongan.ts
 * "Versi Tongkrongan" — penjelasan ulang tiap task statement dalam Bahasa Indonesia santai.
 * Materi asli tetap Bahasa Inggris (ujiannya Bahasa Inggris), tapi ini yang bikin
 * mahasiswa non-IT paham dulu konsepnya sebelum baca teks aslinya.
 *
 * Struktur per task:
 *   analogi  — perumpamaan sehari-hari, satu-dua kalimat
 *   poin     — penjelasan utama, mendukung inline **bold**, `code`, [link](url)
 *   istilah  — kamus istilah ujian: istilah asli (English) → arti santai
 *   catat    — satu baris aturan keputusan buat dihafal H-1
 */
export interface Istilah {
  term: string;
  arti: string;
}

export interface Tongkrongan {
  analogi: string;
  poin: string[];
  istilah: Istilah[];
  catat: string;
}

export const tongkrongan: Record<string, Tongkrongan> = {
  /* ============================== DOMAIN 1 ============================== */
  "1.1": {
    analogi:
      "Agent itu kayak lu nitip kerjaan ke temen yang gerak langkah demi langkah. Dia bakal terus lanjut selama dia masih butuh sesuatu (minta tool), dan berhenti cuma kalau dia bilang udah kelar.",
    poin: [
      "Agentic loop itu **alur kerja yang ditulis di kode**, bukan trik prompt. Bayangin mesin cuci: masuk baju → proses → masih ada busa? ulang → udah bersih? stop.",
      "Empat langkah yang diulang terus: (1) kirim request ke Claude **beserta seluruh riwayat percakapan**, (2) cek kolom `stop_reason`, (3) kalau `tool_use` → jalanin tool-nya lalu **tempelin hasilnya balik ke riwayat**, (4) kalau `end_turn` → selesai, tampilin ke user.",
      "Langkah 3 itu titik yang paling sering bikin loop rusak. Kalau hasil tool lupa dimasukin balik ke riwayat, Claude jadi kayak temen yang nanya 'jadi hasilnya apa?' — dia nggak pernah liat jawabannya, jadi nggak ada hal baru yang bisa dikerjain.",
      "`stop_reason` itu **satu-satunya sinyal yang boleh lu pakai** buat mutusin lanjut atau stop. `tool_use` = lanjut, `end_turn` = beres. Deterministik, nggak ambigu.",
      "Tiga jebakan yang sering muncul jadi pilihan jawaban: (1) nyari kalimat 'gue udah selesai' di teks — bahasa manusia itu ambigu; (2) batesin 'maksimal 10 putaran' sebagai mekanisme **utama** — itu cuma jaring pengaman; (3) cek `response.content[0].type == 'text'` — Claude bisa nulis teks **DAN** minta tool di respons yang sama, jadi cek ini salah total.",
      "Catatan praktik di luar guide: API aslinya juga balikin nilai lain seperti `max_tokens`, `pause_turn`, `stop_sequence`, `refusal`. Prinsipnya tetap satu — apa pun selain `end_turn` artinya belum selesai, cek kenapa.",
    ],
    istilah: [
      { term: "stop_reason", arti: "kolom di respons Claude yang ngasih tau dia mau ngapain lagi. `tool_use` = minta tool, `end_turn` = kelar." },
      { term: "agentic loop", arti: "siklus kerja agent yang ditulis di kode, bukan disuruh lewat prompt." },
      { term: "tool_use", arti: "penanda kalau Claude mau manggil tool. Loop harus lanjut." },
      { term: "end_turn", arti: "penanda kalau Claude udah selesai. Loop berhenti." },
      { term: "iteration cap", arti: "batas jumlah putaran. Fungsinya jaring pengaman, BUKAN rem utama." },
      { term: "model-driven", arti: "Claude sendiri yang mutusin tool mana yang dipakai, bukan alur yang di-hardcode." },
    ],
    catat: "Cek `stop_reason`, bukan kata-kata. Iteration cap itu jaring pengaman, bukan rem utama.",
  },

  "1.2": {
    analogi:
      "Kalau grup WA lu punya ketua, semua info lewat ketua. Anggota nggak boleh chat langsung ke anggota lain — biar nggak ada info nyasar dan nggak ada yang ngerasa paling tahu.",
    poin: [
      "Polanya namanya **hub-and-spoke**: satu **coordinator** di tengah, banyak **subagent** di sekeliling. **Semua komunikasi lewat coordinator.** Subagent nggak pernah ngobrol langsung satu sama lain.",
      "Subagent itu **pelupa by design**: dia nggak bawa riwayat obrolan coordinator, nggak ada memori bareng, dan nggak liat hasil kerja subagent lain. Makanya coordinator wajib ngirim semua konteks yang dia butuh — nggak ada yang 'otomatis kebagi'.",
      "Tugas coordinator ada tiga: **pecah** kerjaan jadi bagian-bagian, **assign** ke subagent, lalu **gabungin** hasilnya jadi satu jawaban.",
      "Jebakan paling gede di ujian: hasil riset bolong (misal soal energi cuma dapet solar & wind, geothermal kelewat). Yang salah **BUKAN** subagent-nya — mereka ngerjain persis apa yang diminta. Yang salah adalah **decomposition coordinator terlalu sempit**.",
      "Kalau ada opsi jawaban 'biar subagent bisa komunikasi langsung, lebih efisien' → itu jawaban salah. Itu ngerusak prinsip arsitekturnya.",
      "Nambah subagent juga **bukan** solusi buat coverage gap. Kalau assignment-nya nggak nyebut topik itu, nambah 5 subagent pun tetap nggak nulis soal topik itu.",
    ],
    istilah: [
      { term: "coordinator", arti: "bos/orkestrator yang bagi tugas dan gabungin hasil." },
      { term: "subagent", arti: "pekerja khusus yang ngerjain satu bagian kecil." },
      { term: "hub-and-spoke", arti: "pola bintang: semua komunikasi lewat pusat, bukan antar cabang." },
      { term: "decomposition", arti: "cara coordinator mecah tugas gede jadi bagian kecil." },
      { term: "coverage gap", arti: "ada bagian topik yang nggak di-assign ke siapa pun → hasil akhirnya bolong." },
    ],
    catat: "Hasil bolong = salah coordinator yang mecah tugas, bukan salah anak buahnya.",
  },

  "1.3": {
    analogi:
      "Ngitip paket ke kurir: kalau alamat dan nomor rumahnya nggak ditulis, paketnya nggak bakal nyampe. Konteks + metadata sumber = alamat paketnya.",
    poin: [
      "Coordinator manggil subagent pakai tool `Task` (nama barunya `Agent`). Syarat mutlak: tool itu **harus terdaftar di `allowedTools`** punya coordinator. Kalau nggak ada, nggak satu pun subagent bisa dipanggil — sebagus apa pun subagent-nya didefinisin.",
      "Konteks yang dikirim harus **lengkap + ada metadata sumbernya**: URL, nama dokumen, nomor halaman. Bukan cuma isi teksnya.",
      "Kenapa metadata itu wajib? Karena laporan akhir yang bisa nyitir sumber cuma bisa dibikin dari metadata yang beneran dikirim. Kalau URL dan nama dokumen dibuang di tengah jalan, hasil akhirnya pasti tanpa atribusi — dan **nggak ada prompt yang bisa nambal ini**, karena model nggak bisa ngarang URL yang valid.",
      "Tugas yang **independen** sebaiknya di-spawn **paralel**: kirim beberapa panggilan Task dalam satu respons coordinator. Jauh lebih cepet daripada nunggu satu-satu di turn terpisah.",
      "`--resume` vs `fork_session` sering ketuker: **resume** = lanjutin sesi yang sama; **fork** = bikin cabang dari sesi itu buat eksplorasi arah berbeda. Dua hal yang beda.",
    ],
    istilah: [
      { term: "Task / Agent tool", arti: "tool buat manggil subagent. Wajib terdaftar di allowedTools." },
      { term: "allowedTools", arti: "daftar tool yang boleh dipakai. Tanpa `Agent`/`Task`, subagent nggak bisa dipanggil sama sekali." },
      { term: "context passing", arti: "ngirim konteks + metadata (URL, dokumen, halaman) dari coordinator ke subagent." },
      { term: "parallel spawning", arti: "manggil banyak subagent sekaligus dalam satu respons." },
      { term: "fork_session", arti: "bikin cabang sesi baru dari sesi lama. Beda dari resume." },
      { term: "atribusi", arti: "nyebut sumber data di hasil akhir." },
    ],
    catat: "Konteks wajib bawa metadata sumber. Independen → spawn paralel.",
  },

  "1.4": {
    analogi:
      "Ngingetin anak kos lewat pesan grup itu 90% berhasil. Ngegembok pintunya sampai dia bayar — itu 100%. Bedanya cuma satu: imbauan vs sistem.",
    poin: [
      "Ada dua level ngeatur agent: **prompt-based** (instruksi + contoh) dan **programmatic enforcement** (dipaksa lewat kode). Prompt itu **probabilistik** — biasanya jalan 90-95%. Kode itu **deterministik** — 100%.",
      "Aturan keputusan ujian: kalau **satu saja kegagalan** bisa bikin rugi duit, bobol keamanan, atau melanggar compliance → **wajib pakai kode**. Bukan prompt yang dipertegas, bukan few-shot, bukan classifier.",
      "Caranya: **prerequisite gate** — tool `process_refund` secara fisik nggak bisa jalan sebelum `get_customer` balikin customer ID yang terverifikasi. Model nggak punya jalan buat nyolong.",
      "Kalau muncul opsi 'perkuat prompt', 'tambah few-shot', atau 'bikin routing classifier' buat kasus uang/keamanan/regulasi → tiga-tiganya **jawaban salah**. Cuma kode yang 100%.",
      "Buat **handoff ke manusia**, ringkasannya harus **berdiri sendiri**. Manusia yang nerima nggak bisa nge-scroll chat lama. Wajib ada: customer ID, ringkasan masalah, dan rekomendasi aksi.",
      "Latar tambahan (nggak diuji, tapi bagus diketahui): hook `SubagentStart` cuma bisa ngeliat, nggak bisa ngeblok. Hook `SubagentStop` bisa ngeblok — exit code 2 artinya 'balik kerja lagi'.",
    ],
    istilah: [
      { term: "prompt-based guidance", arti: "ngatur perilaku lewat instruksi/contoh. Probabilistik, bisa gagal." },
      { term: "programmatic enforcement", arti: "ngatur perilaku lewat kode. Deterministik, 100%." },
      { term: "prerequisite gate", arti: "gerbang di kode yang ngeblok tool sampai syaratnya terpenuhi." },
      { term: "hook", arti: "kode yang jalan otomatis di titik tertentu (sebelum/sesudah tool)." },
      { term: "handoff", arti: "estafet tugas dari agent ke manusia, harus pakai ringkasan mandiri." },
    ],
    catat: "Duit, keamanan, compliance → kode (gate). Bukan prompt.",
  },

  "1.5": {
    analogi:
      "`PreToolUse` itu satpam yang ngeblok SEBELUM masuk. `PostToolUse` itu petugas yang ngerapiin barang SETELAH masuk. Kebalik = masalah.",
    poin: [
      "Dua arah hook, jangan ketuker: **`PreToolUse`** jalan **sebelum** tool dieksekusi (buat ngeblok/melarang), **`PostToolUse`** jalan **sesudah** tool sukses (buat ngerapiin/transformasi hasil).",
      "Contoh `PostToolUse`: hasil tool tanggalnya campur-campur (`12/03/2026`, `March 12`, `12 Mar 26`) → hook-nya yang menyeragamkan. **Bukan model, bukan prompt** — karena kalau diserahin ke model, hasilnya bisa beda-beda tiap kali.",
      "Contoh `PreToolUse`: aturan anti pencucian uang. Hook nge-`deny` `transfer_funds` sampai `aml_check` balikin status pass. 100% nggak bisa dibobol.",
      "Salah urutan = salah total. Pakai `PostToolUse` buat ngeblokir itu artinya transaksinya **udah kejadian** dulu baru di-flag. Buat transaksi uang, itu sudah telanjur melanggar.",
      "Kalau permintaan kliennya 'harus 100%', semua opsi yang isinya prompt / few-shot / confidence threshold otomatis salah. Jawabannya hook + kode.",
    ],
    istilah: [
      { term: "PreToolUse hook", arti: "kode yang jalan sebelum tool dieksekusi — buat enforce policy atau ngeblok." },
      { term: "PostToolUse hook", arti: "kode yang jalan setelah tool sukses — buat normalisasi/transformasi data." },
      { term: "deny", arti: "keputusan hook buat nolak eksekusi tool." },
      { term: "exit code 2", arti: "sinyal dari hook biar agent dikembalikan buat kerja lagi." },
    ],
    catat: "Ngeblok = Pre. Ngerapiin = Post. Jangan kebalik.",
  },

  "1.6": {
    analogi:
      "Ngecek 14 file sekaligus itu kayak nge-review 14 skripsi dalam satu malam — yang awal dibaca detail, yang terakhir cuma di-ACC biar cepet kelar.",
    poin: [
      "Ada dua pola decomposition. **Fixed sequential pipeline** (prompt chaining): langkah dan urutannya di-hardcode — cocok buat kerjaan yang terstruktur dan predictable. **Dynamic adaptive decomposition**: langkahnya ditentuin sambil jalan sesuai temuan — cocok buat investigasi yang ujungnya belum jelas.",
      "Masalah utama kalau semua file dimasukin sekali jalan: **attention dilution**. Perhatian model menipis, file awal dapet review detail, file belakang banyak yang lolos bug.",
      "Solusinya dua pass: **pass lokal per file** (biar kedalamannya konsisten) + **pass cross-file** (buat ngecek aliran data dan inkonsistensi antar file — misalnya kode yang sama di-ACC di satu file tapi di-flag di file lain).",
      "Yang **BUKAN** solusi: ganti ke model lebih besar, gedein context window, atau nulis 'review semua file dengan teliti' di prompt. Tiga-tiganya tetap probabilistik dan tetap kena dilution.",
      "Batch file jadi beberapa grup **tanpa** pass cross-file juga salah — lu cuma mindahin masalahnya, inkonsistensi antar grup tetap nggak ketangkep.",
    ],
    istilah: [
      { term: "fixed pipeline / prompt chaining", arti: "langkah tetap yang ditentukan di awal." },
      { term: "dynamic adaptive decomposition", arti: "langkah ditentukan sambil jalan sesuai temuan." },
      { term: "attention dilution", arti: "perhatian model menipis kalau konteksnya kebanyakan." },
      { term: "local pass", arti: "review per file satu-satu." },
      { term: "cross-file integration pass", arti: "review khusus buat ngecek hubungan antar file." },
    ],
    catat: "Banyak file → pecah: per-file dulu, baru cross-file. Model lebih gede bukan jawaban.",
  },

  "1.7": {
    analogi:
      "Sesi lama itu kayak temen yang masih ngehafal denah kos lu sebelum direnovasi. Sarannya masih pakai peta lama — bukan karena dia bodoh, tapi karena infonya basi.",
    poin: [
      "Tiga opsi manajemen sesi, beda fungsi: **resume** (lanjutin sesi yang sama beserta riwayatnya), **fork** (bikin cabang dari sesi buat eksplorasi arah lain), dan **fresh start + suntik ringkasan** (buat kalau hasil tool lama udah basi).",
      "Kalau kode udah berubah tapi lu `--resume`, Claude bakal ngasih saran berdasarkan kode yang udah nggak ada. Itu **stale context** — bukan salah model, konteksnya yang kedaluwarsa.",
      "Cara benarnya: **mulai sesi baru**, lalu kasih (a) ringkasan temuan yang **masih relevan**, dan (b) daftar file yang berubah. Jadi dia cuma re-analisis bagian yang perlu — akurat tapi nggak boros.",
      "Yang salah: **full re-analyze 50 file dari nol** (boros dan temuan lama yang masih valid kebuang) atau `fork_session` (cabangnya tetap bawa riwayat basi, jadi sumber masalahnya masih ada).",
      "Arah sebaliknya juga salah: cuma nunjukin 3 file yang berubah tanpa ringkasan temuan lama — konteks validnya ikut ilang.",
    ],
    istilah: [
      { term: "resume", arti: "lanjutin sesi yang sama, termasuk seluruh riwayatnya." },
      { term: "fork_session", arti: "bikin cabang sesi buat eksplorasi arah berbeda." },
      { term: "stale context", arti: "konteks lama yang udah nggak relevan karena ada perubahan." },
      { term: "targeted re-analysis", arti: "re-analisis cuma bagian yang berubah, bukan semuanya." },
    ],
    catat: "File berubah → sesi baru + ringkasan temuan + daftar file yang berubah.",
  },

  /* ============================== DOMAIN 2 ============================== */
  "2.1": {
    analogi:
      "Deskripsi tool itu menu di warteg. Kalau dua menu tulisannya cuma 'nasi + lauk', ya pelanggan asal nunjuk.",
    poin: [
      "Claude milih tool dari **deskripsi**-nya. Deskripsi yang tipis dan mirip-mirip = agent sering salah pilih (misrouting).",
      "Fix paling murah dan paling ngefek: **tulis deskripsi yang lengkap** — format input, contoh query, edge case, dan batas eksplisit seperti 'jangan pakai untuk X, pakai tool Y'.",
      "Urutan perbaikan yang benar: **deskripsi dulu**. Few-shot itu langkah berikutnya, sedangkan routing classifier dan konsolidasi tool itu over-engineering kalau akar masalahnya cuma deskripsi.",
      "Kalau satu tool ngerjain dua hal yang beda jauh, atau namanya nggak nunjukin fungsinya → **pisah atau ganti nama** biar jelas.",
      "Jangan lupa: setelah deskripsi tool diubah, **cek lagi system prompt**-nya. Kadang system prompt masih nyebut tool lama atau ngasih arahan yang bentrok dengan deskripsi baru.",
    ],
    istilah: [
      { term: "tool description", arti: "penjelasan fungsi tool yang dibaca Claude buat milih. Ini 'menu'-nya." },
      { term: "misrouting", arti: "agent salah pilih tool." },
      { term: "tool splitting", arti: "mecah satu tool jadi beberapa yang lebih spesifik." },
      { term: "routing classifier", arti: "model terpisah buat nentuin tool — over-engineering sebagai langkah pertama." },
    ],
    catat: "Tool salah pilih → benerin deskripsinya dulu, bukan tambah few-shot.",
  },

  "2.2": {
    analogi:
      "Kalau gue nanya stok barang terus jawabannya kosong, itu belum tentu tokonya tutup. Bisa jadi barangnya memang habis. Dua hal yang beda banget.",
    poin: [
      "Error dipisah jadi kategori biar agent bisa mutusin langkah berikutnya: **transient** (coba lagi nanti), **validation** (input/data lu yang salah, betulin dulu), **business** (aturannya nggak boleh, cari jalur lain), **permission** (aksesnya kurang).",
      "**Yang paling sering kejureum:** hasil kosong dari query yang sukses itu **BUKAN error**. Query-nya jalan normal, datanya memang nggak ada.",
      "Bentuk responsnya harus bisa dibedain: sukses-tapi-kosong = `resultCount: 0` + `isError: false` (jangan retry); database nggak ke-reach = `isError: true` + `isRetryable: true` (boleh retry).",
      "`isRetryable: false` artinya **'jangan retry, cari cara lain'** — bukan 'buang tugasnya'.",
      "Di sistem multi-agent, error jangan diburamkan. Balikin hasil kosong yang dibilang sukses itu bikin coordinator **buta** — dia ngira risetnya kelar padahal satu sumber gagal.",
      "Pesan generik kayak 'Operation failed' itu nggak berguna. Error harus bawa metadata terstruktur biar agent bisa milih aksi.",
    ],
    istilah: [
      { term: "transient error", arti: "gagal sementara (mis. timeout) — aman buat di-retry." },
      { term: "validation error", arti: "data/input yang salah — harus dibetulin dulu." },
      { term: "business error", arti: "ditolak aturan/kebijakan — cari jalur lain, jangan retry." },
      { term: "isRetryable", arti: "penanda apakah percobaan ulang masuk akal." },
      { term: "valid empty result", arti: "query sukses tapi datanya memang nggak ada." },
    ],
    catat: "Hasil kosong ≠ gagal. Bedain dua hal ini, salah bedain = agent nggak berguna.",
  },

  "2.3": {
    analogi:
      "Ngurusin surat RT bolak-balik ke kelurahan itu remeh tapi buang waktu. Kasih aja mandat ke pos jaga biar urusan kecil kelar di tempat.",
    poin: [
      "Masalah pertama: **tool overload**. Kasih agent 18 tool, dia jadi ragu dan salah pilih. Solusinya scope tool sesuai peran dan gabung tool yang hampir kembar.",
      "Kalau 85% permintaan subagent cuma lookup sederhana, tapi tiap kali harus bolak-balik ke coordinator (2-3 round trip, latency naik) → **kasih dia tool kecil yang scoped**. Verifikasi yang kompleks tetap lewat coordinator.",
      "`tool_choice` tiga mode: `auto` (terserah model), `any` (wajib manggil tool), dan nama tool spesifik (wajib tool itu). Buat output terstruktur yang harus dipaksa, `auto` itu pilihan yang salah.",
      "Tool generik lebih rawan disalahgunain: `fetch_url` bisa ngambil apa aja dari internet. `load_document` yang dibatasi cakupannya jauh lebih aman.",
      "Hati-hati jebakan 'atur semua lewat coordinator biar rapi' — itu beneran rapi tapi lambat, dan buat lookup kecil tetap salah secara design.",
    ],
    istilah: [
      { term: "tool overload", arti: "kebanyakan tool bikin agent bingung memilih." },
      { term: "tool_choice", arti: "pengaturan seberapa bebas model memilih tool (`auto`, `any`, atau tool tertentu)." },
      { term: "scoped tool", arti: "tool yang cakupannya dibatasi biar nggak disalahgunain." },
      { term: "round trip", arti: "bolak-balik komunikasi antar agent yang nambah latency." },
    ],
    catat: "Lookup kecil → kasih tool scoped. Verifikasi kompleks → tetap ke coordinator.",
  },

  "2.4": {
    analogi:
      "Mau bikin nasi goreng nggak perlu bikin wajan baru — pinjam punya tetangga kalau memang cukup.",
    poin: [
      "Konfigurasi MCP punya **hirarki scope**: user-level di `~/.claude.json` (cuma mesin lu), project-level di `.mcp.json` di dalam repo (ikut ke-share ke tim), dan local.",
      "Config buat **tim** jangan ditaruh di user-level. Kalau ada masalah 'cuma di mesin gue yang jalan, di mesin lainnya nggak' — tersangka utamanya config-nya nyangkut di scope pribadi.",
      "**Jangan tempel kredensial mentah** di file yang di-commit. Pakai ekspansi environment variable seperti `${JIRA_TOKEN}` biar token-nya nggak ikut ke GitHub.",
      "**Build vs use**: mau integrasi ke layanan populer kayak Jira? **Cari MCP server community dulu**. Bikin custom cuma kalau kebutuhan timnya benar-benar spesifik dan nggak ke-cover server yang ada.",
      "Deskripsi tool MCP punya peran yang sama kayak tool biasa. Kalau tipis dan nggak jelas, agent bakal lebih milih built-in tool dan MCP server lu nganggur.",
    ],
    istilah: [
      { term: "MCP (Model Context Protocol)", arti: "standar nyambungin tool/layanan eksternal ke Claude." },
      { term: ".mcp.json", arti: "config MCP tingkat project — ikut repo, ke-share ke tim." },
      { term: "env variable expansion", arti: "nulis `${TOKEN}` biar rahasia nggak ikut ter-commit." },
      { term: "MCP resource", arti: "data/berkas yang diekspos server MCP." },
    ],
    catat: "Layanan populer → pakai server community dulu, jangan bangun sendiri.",
  },

  "2.5": {
    analogi:
      "Nyari nama file pakai Glob, nyari isi file pakai Grep. Kalau ketuker, hasilnya kosong dan lu ngira datanya nggak ada — padahal salah alat.",
    poin: [
      "Bedakan dua alat cari: **Grep = nyari ISI file** (kata, nama fungsi, string), **Glob = nyari NAMA/pola file** (mis. `**/*.test.ts`).",
      "Skenario klasik: 'cari siapa yang manggil fungsi `processLegacyOrder`, lalu cari file test-nya'. Langkahnya: **Grep** nama fungsinya dulu (dapet caller langsung, termasuk test yang import), baru **Glob** pola file test di sebelahnya (buat test yang manggil lewat modul tanpa nyebut nama fungsinya).",
      "`Read`, `Write`, dan `Edit` punya peran masing-masing. Untuk ngubah file, **coba `Edit` dulu** — lebih hemat daripada baca ulang lalu tulis ulang seluruh file.",
      "Kalau `Edit` ngelaporin match-nya nggak unik, yang perlu diperjelas itu **konteks string**-nya (bikin `old_string` lebih spesifik), bukan asal replace semua.",
      "Jangan baca semua file di awal. Pahami dulu bagian mana yang relevan, baru baca yang perlu — hemat context budget.",
    ],
    istilah: [
      { term: "Grep", arti: "nyari isi file (kata/kode di dalamnya)." },
      { term: "Glob", arti: "nyari nama atau pola file." },
      { term: "Read / Write / Edit", arti: "baca, tulis, dan ubah file." },
      { term: "incremental understanding", arti: "paham codebase pelan-pelan sesuai kebutuhan, bukan baca semua di awal." },
    ],
    catat: "Cari isi → Grep. Cari nama file → Glob. Ubah file → Edit dulu.",
  },

  /* ============================== DOMAIN 3 ============================== */
  "3.1": {
    analogi:
      "Aturan rumah tangga itu ditulis di papan di ruang tamu biar semua penghuni liat — bukan di catatan pribadi salah satu anak.",
    poin: [
      "`CLAUDE.md` punya **tiga tingkat**: **user** (`~/.claude/CLAUDE.md`, cuma kebaca di mesin lu), **project** (di dalam repo, ikut ke-clone semua orang), dan **subdirektori** (buat folder tertentu aja).",
      "Kalau dua developer di repo dan branch yang sama tapi perilaku Claude-nya beda → tersangka utamanya: **konvensinya nyangkut di `CLAUDE.md` user-level punya salah satu orang**. Jadi cuma mesin dia yang ke-load.",
      "Aturan tim **wajib** taruh di project-level. Titik.",
      "Kalau konflik, yang lebih spesifik yang menang. Biar rapi, pecah file pakai **import `@path`** daripada bikin satu file raksasa.",
      "`/memory` itu cuma **nampilin** config yang sedang ke-load — bukan yang bikin loading. Dan penting: ada bagian yang **selamat dari compaction**, jadi tetap ada walau konteks dipangkas.",
    ],
    istilah: [
      { term: "CLAUDE.md", arti: "file instruksi/config yang dibaca Claude Code." },
      { term: "user-level", arti: "`~/.claude/` — cuma berlaku di mesin lu." },
      { term: "project-level", arti: "di dalam repo — ikut tim lewat git." },
      { term: "@path import", arti: "nyisipin file lain ke dalam CLAUDE.md." },
      { term: "/memory", arti: "perintah buat lihat config yang sedang aktif." },
    ],
    catat: "Konvensi tim → project-level. Bukan user-level.",
  },

  "3.2": {
    analogi:
      "Resep keluarga ditaruh di buku bersama. Resep rahasia buat lu sendiri disimpen di laci pribadi.",
    poin: [
      "Command/skill yang mau **dipakai bareng tim** → taruh di `.claude/commands/` atau `.claude/skills/` **di dalam repo** (ikut ke-clone semua orang). Yang **personal** → `~/.claude/`.",
      "Skill **bukan file markdown lepas**. Strukturnya: `.claude/skills/<nama>/SKILL.md`. Bikin `.claude/skills/review.md` doang nggak bakal jadi command `/review`.",
      "Skill **dipanggil manual** — beda dari `CLAUDE.md` yang ke-load otomatis. Jadi jangan taruh aturan wajib di skill: gampang kelewat.",
      "Skill yang outputnya panjang dan nggak mau numpuk di percakapan utama → pakai frontmatter `context: fork` biar jalan di ruang sendiri.",
      "Bedakan juga: **slash command** buat prosedur/task tertentu, **CLAUDE.md** buat aturan yang selalu berlaku, **rules** buat aturan yang bergantung jenis file.",
    ],
    istilah: [
      { term: "slash command", arti: "perintah custom yang dipanggil pakai `/nama`." },
      { term: "skill", arti: "paket instruksi yang bisa di-reuse — folder + file SKILL.md." },
      { term: "frontmatter", arti: "bagian paling atas file buat setelan seperti `context: fork`." },
      { term: "context: fork", arti: "bikin skill jalan di konteks terpisah." },
    ],
    catat: "Tim → repo (`.claude/`). Personal → `~/.claude/`.",
  },

  "3.3": {
    analogi:
      "Aturan 'jangan pakai sendal di dalam rumah' nggak perlu ditempel di setiap pintu — cukup satu papan di depan.",
    poin: [
      "Kalau aturannya cuma berlaku buat **jenis file tertentu** (misal semua file test), jangan numpuk di root `CLAUDE.md`. Root itu **ke-load terus**, jadi aturan yang jarang kepakai bikin boros konteks.",
      "Jangan juga copy-paste `CLAUDE.md` ke 50 direktori — itu mimpi buruk maintenance. Sekali ganti aturan, lu harus edit belasan file.",
      "Solusinya: satu file di `.claude/rules/` dengan **frontmatter `paths`** berisi pola glob, contoh `[\"**/*.test.tsx\", \"**/*.test.ts\"]`. Ke-load **cuma saat nyentuh file yang cocok**, dan berlaku di seluruh codebase.",
      "Directory-level `CLAUDE.md` kalah untuk konvensi yang nyebar lintas folder. Skill juga bukan tempatnya — skill harus dipanggil manual, gampang kelewat.",
    ],
    istilah: [
      { term: "path-specific rule", arti: "aturan yang aktif cuma kalau file yang disentuh cocok." },
      { term: "frontmatter paths", arti: "daftar pola file yang jadi pemicu aturan." },
      { term: "glob pattern", arti: "pola pencocokan nama file seperti `**/*.test.ts`." },
    ],
    catat: "Aturan per jenis file → `.claude/rules/` + glob. Bukan root, bukan copy-paste.",
  },

  "3.4": {
    analogi:
      "Bongkar dapur itu butuh rencana dulu. Ganti lampu kamar — ya cabut-tancep aja.",
    poin: [
      "**Plan mode** = mikir dulu, nyusun rencana, baru eksekusi. Cocok buat refactor besar, migrasi banyak file, dan perubahan arsitektur.",
      "**Direct execution** = langsung gas. Cocok buat fix yang jelas, scope kecil, dan ada stack trace yang nunjukin masalahnya.",
      "Ujian suka kasih **tiga skenario campuran** dalam satu soal. Jangan jawab 'semua plan' atau 'semua langsung' — sesuaikan mode dengan kompleksitas dan risiko **masing-masing**.",
      "Ada titik tengah yang sering jadi jawaban benar: **hybrid / plan-lalu-eksekusi** — rencana dulu buat bagian yang ribet, langsung eksekusi buat bagian yang jelas.",
      "Nunggu kompleksitas muncul baru pindah ke plan mode itu keputusan yang lemah. Kompleksitas harus dikenali **di depan**.",
    ],
    istilah: [
      { term: "plan mode", arti: "mode bikin rencana sebelum ngubah kode." },
      { term: "direct execution", arti: "langsung eksekusi tanpa fase rencana." },
      { term: "explore subagent", arti: "subagent buat nyisir codebase ngumpulin konteks." },
      { term: "hybrid approach", arti: "gabungan: plan buat bagian ribet, eksekusi buat sisanya." },
    ],
    catat: "Besar & berisiko → plan. Kecil & jelas → langsung. Campuran → hybrid.",
  },

  "3.5": {
    analogi:
      "Ngasih contoh 'masuknya kayak ini, keluarnya kayak ini' jauh lebih ngefek daripada ngejelasin pakai paragraf panjang.",
    poin: [
      "Kalau transformasi yang lu jelasin pakai prosa bikin hasilnya beda-beda tiap run, itu tandanya **ambigu**. Tangga perbaikannya, dari yang paling murah: (1) **2-3 contoh konkret input→output**, (2) bikin **test suite** lalu iterasi dari kegagalan test, (3) **interview pattern** — biarin Claude yang nanya balik.",
      "Mulai dari contoh konkret. Test suite itu rung kedua — bagus buat jaga regresi, tapi lebih mahal di awal.",
      "Interview pattern cocok kalau yang kurang itu **konteks**, bukan bentuk output.",
      "Prosa yang 'lebih presisi' tetap prosa — model tetap bisa interpretasi beda tiap kali jalan.",
      "Buat feedback: **batch** kalau masalahnya nyebar di banyak tempat; **sekuensial** kalau temuan satu mempengaruhi temuan berikutnya.",
    ],
    istilah: [
      { term: "example-based refinement", arti: "benerin perilaku model pakai contoh konkret." },
      { term: "test suite iteration", arti: "benerin dari error yang keluar di test." },
      { term: "interview pattern", arti: "biarin Claude yang nanya balik buat ngelengkapi konteks." },
      { term: "batch vs sequential feedback", arti: "umpan balik sekaligus vs satu-satu." },
    ],
    catat: "Hasil nggak konsisten → kasih contoh input/output konkret dulu.",
  },

  "3.6": {
    analogi:
      "Kalau lu nyuruh orang kerja tapi nggak bilang 'nggak usah nanya, kerjain aja', ya dia bakal nungguin lu — dan lu nggak datang.",
    poin: [
      "Jalanin Claude Code di CI itu **beda dari di terminal**. Di CI harus pakai flag **`-p` (print mode)** biar dia nggak nunggu input manusia.",
      "Gejala klasik: job CI **hang / nggak pernah selesai**. 9 dari 10 penyebabnya Claude Code nunggu input interaktif — bukan bug, cuma salah mode.",
      "Review yang bagus itu **independen**. Self-review di sesi yang sama nggak sekuat review dengan konteks terpisah.",
      "Buat pre-merge check yang bikin orang nunggu → pakai **real-time**. Batch API butuh waktu jam-an, jadi nggak cocok buat yang ngeblok.",
      "Sertakan **temuan review sebelumnya** di run berikutnya biar nggak ngulang komentar yang sama terus.",
    ],
    istilah: [
      { term: "print mode (`-p`)", arti: "mode non-interaktif buat CI: prompt diproses, output ke stdout, nggak nunggu input." },
      { term: "session context isolation", arti: "tiap run punya konteks sendiri biar review tetap independen." },
      { term: "incremental review", arti: "review lanjutan yang bawa temuan sebelumnya." },
    ],
    catat: "CI hang → dia nunggu input. Pakai `-p`.",
  },

  /* ============================== DOMAIN 4 ============================== */
  "4.1": {
    analogi:
      "Kalau satpamnya kebanyakan nangkep orang yang nggak bersalah, warga berhenti percaya — dan pas ada maling beneran, nggak ada yang lapor lagi.",
    poin: [
      "Kriterianya harus **eksplisit**, ada batas keputusan yang bisa ditindaklanjuti. Kalimat kayak 'cuma laporin kalau yakin' itu **terlalu vague** — model nggak punya ambang yang jelas.",
      "Masalah nyatanya: satu kategori review dengan **banyak false positive** (misal 40%) bikin developer **ngopecat SEMUA laporan** — termasuk temuan security yang beneran penting. Namanya **trust poisoning**.",
      "Fix pertama yang paling cepat balikin kepercayaan: **matiin dulu kategori yang berisik itu**, sambil kriterianya dibenerin pakai contoh kode konkret dan kalibrasi severity.",
      "Yang salah: naikin confidence threshold, bikin second pass, atau filter pakai voting — mahal, rumit, dan nggak nyentuh akar masalahnya (kriterianya yang lemah).",
      "Pengalaman developer itu aset. Sekali kena banjir false positive, dia bakal cuek sama semua output review.",
    ],
    istilah: [
      { term: "false positive", arti: "laporan yang ternyata bukan masalah." },
      { term: "trust poisoning", arti: "satu kategori berisik bikin semua laporan nggak dipercaya lagi." },
      { term: "confidence threshold", arti: "ambang keyakinan — bukan solusi buat kriteria yang kabur." },
      { term: "severity calibration", arti: "nyetel tingkat keparahan pakai contoh kode nyata." },
    ],
    catat: "Kategori berisik → matiin dulu, benerin kriterianya. Jangan naikin threshold.",
  },

  "4.2": {
    analogi:
      "Nunjukin 3 contoh 'cara ngambilnya kayak gini' jauh lebih gampang daripada ngomong 'pokoknya gitu'.",
    poin: [
      "Kalau model **jago** di satu format (mis. tabel) tapi **gagal** di format lain (cerita/paragraf) padahal infonya sama → masalahnya bukan instruksi, tapi **pola**. Kasih **few-shot**.",
      "Kuncinya: contohnya harus mencakup **KEDUA format**. Kalau contohnya cuma dari tabel, dokumen naratif tetap gagal.",
      "Few-shot juga ngefek buat **ngurangin halusinasi** dan **ngurangin false positive** di penilaian yang sifatnya judgement call.",
      "Yang salah: nambah instruksi lebih detail, naikin confidence threshold, atau bikin pipeline pra-proses buat normalisasi format — semuanya lebih mahal daripada ngasih 2-3 contoh.",
      "Few-shot bukan cuma ngajarin pattern-matching literal. Dia ngajarin model **cara mikir** kasus itu.",
    ],
    istilah: [
      { term: "few-shot", arti: "ngasih beberapa contoh input→output langsung di prompt." },
      { term: "pattern extraction", arti: "model ngenalin pola dari contoh yang dikasih." },
      { term: "judgement call", arti: "penilaian yang butuh contoh buat kalibrasi." },
    ],
    catat: "Gagal di format tertentu → kasih contoh dari format itu juga.",
  },

  "4.3": {
    analogi:
      "Kalau formulirnya semua wajib diisi padahal datanya nggak ada, orang bakal ngarang asal-asalan biar bisa submit.",
    poin: [
      "`tool_use` + **JSON schema** itu cara paling andal buat output terstruktur. Tapi **bukan jaminan** bebas error ekstraksi.",
      "Jebakan besarnya: kalau **semua field wajib** padahal dokumennya nggak punya info itu, model **dipaksa ngarang**. Yang paling khas ngarang: tanggal dan nominal uang.",
      "Solusinya: field yang mungkin nggak ada dibikin **optional / nullable**. Struktur yang jujur lebih berharga daripada formulir yang keliatan rapi.",
      "`tool_choice` tiga mode: `auto` (bebas), `any` (wajib manggil salah satu tool), dan nama tool spesifik. Buat output terstruktur yang dipaksa, `auto` itu pilihan salah.",
      "Instruksi 'jangan ngarang' di prompt **kalah** sama struktur schema. Kalau schema-nya ngepaksa isi, ya dia isi.",
    ],
    istilah: [
      { term: "tool_use", arti: "mekanisme Claude manggil tool dengan argumen terstruktur." },
      { term: "JSON schema", arti: "cetakan struktur data: tipe, field wajib, field opsional." },
      { term: "nullable / optional field", arti: "field yang boleh kosong — jalan keluar yang jujur." },
      { term: "tool_choice", arti: "seberapa dipaksa pemakaian tool oleh model." },
    ],
    catat: "Semua field wajib = model dipaksa ngarang. Bikin yang rawan kosong jadi optional.",
  },

  "4.4": {
    analogi:
      "Kalau gagalnya karena salah hitung, kasih tau salahnya di mana → dia bisa benerin. Kalau datanya memang nggak ada, disuruh ulang 10x pun dia cuma bakal ngarang.",
    poin: [
      "Retry itu harus **cerdas, bukan lotere**. Ada dua jenis gagal yang beda total dan penanganannya berlawanan.",
      "**Jenis A — data ada, model salah:** retry dengan **feedback error yang spesifik** bisa sukses. Contoh: total nggak match, selisihnya £50 → kasih tau selisihnya, suruh re-extract.",
      "**Jenis B — data beneran nggak ada di dokumen:** retry **nggak mungkin** sukses. Model bakal ngarang supaya validasinya lolos. Langsung **human review**.",
      "Retry tanpa pesan error spesifik itu cuma buang biaya. Dan validasi schema doang nggak nangkep error **semantik** (mis. angka total nggak konsisten antar bagian) — tetap butuh validator seperti Pydantic.",
      "Ada juga field `detected_pattern` — nyatet pola masalahnya biar bisa dianalisis, bukan cuma dicoba ulang buta.",
    ],
    istilah: [
      { term: "retry-with-error-feedback", arti: "coba ulang sambil nyertain detail errornya." },
      { term: "semantic validation", arti: "ngecek makna/konsistensi data, bukan cuma format." },
      { term: "schema syntax error", arti: "struktur datanya yang salah (format)." },
      { term: "human review", arti: "estafet hasil ke manusia buat diperiksa." },
    ],
    catat: "Data ada → retry + feedback spesifik. Data nggak ada → human review.",
  },

  "4.5": {
    analogi:
      "Kirim paket lewat jalur ekonomi itu murah tapi nyampe berhari-hari. Kalau butuh besok pagi, ya bayar ekspres.",
    poin: [
      "**Message Batches API**: harganya **sekitar 50% lebih murah**, tapi hasilnya butuh **jam-an**, bukan detik.",
      "Aturan matching-nya simpel: kerjaan yang **nggak ngeblok siapa pun** (laporan semalam, analisis backlog) → batch. Kerjaan yang **ngeblok orang** (pre-merge check) → real-time.",
      "Jangan pindahin semua ke batch demi hemat. Latency itu juga biaya — developer yang nungguin merge berjam-jam itu rugi nyata.",
      "Batch juga nggak cocok buat workflow yang butuh **tool calling multi-turn**.",
      "Sebelum submit batch gede, **optimasi prompt** dulu — jauh lebih murah daripada salah 10.000 kali dalam satu batch.",
    ],
    istilah: [
      { term: "Message Batches API", arti: "jalur murah (~50%) tapi lambat (jam-an)." },
      { term: "blocking workflow", arti: "kerjaan yang bikin orang lain nunggu." },
      { term: "SLA", arti: "batas waktu layanan yang dijanjikan." },
    ],
    catat: "Nggak ngeblok → batch. Ngeblok orang → real-time.",
  },

  "4.6": {
    analogi:
      "Nge-review 14 file sekaligus itu bikin perhatian menipis dan komentarnya bisa kontradiktif sama diri sendiri.",
    poin: [
      "**Self-review di sesi yang sama itu lemah** — instance-nya cenderung setuju sama dirinya sendiri.",
      "Review yang gede harus **multi-pass**: pass per file buat kedalaman + pass terpisah buat integrasi lintas file (aliran data, konsistensi, dan temuan yang saling bertentangan).",
      "**Context window lebih gede bukan solusi** — attention dilution tetap kejadian. Ini pola yang sama kayak task 1.6.",
      "Voting 3x run full-PR itu 3x biaya, dan dilution tetap kejadian di ketiga-tiganya.",
      "Kalau pakai **confidence-based routing** (auto-approve yang skornya tinggi), skornya harus **dikalibrasi dulu**. Jangan pakai angka mentah.",
    ],
    istilah: [
      { term: "self-review", arti: "review oleh instance yang sama — cenderung bias." },
      { term: "multi-pass review", arti: "beberapa pass review terpisah." },
      { term: "confidence-based routing", arti: "mutusin otomatis vs manual berdasarkan skor keyakinan." },
      { term: "calibration", arti: "nyocokin skor keyakinan dengan hasil nyata." },
    ],
    catat: "Review gede → per-file pass + cross-file pass. Model lebih besar bukan jawaban.",
  },

  /* ============================== DOMAIN 5 ============================== */
  "5.1": {
    analogi:
      "Ngeringkas percakapan itu kayak ngeringkas cerita: 'ada pembayaran sejumlah uang' — nominalnya hilang, padahal itu inti masalahnya.",
    poin: [
      "Context window itu batas nyata. Kalau percakapan makin panjang, sistem biasanya **meringkas** riwayat lama — dan ringkasan itu **makan detail**.",
      "Yang paling sering hilang: **angka transaksional** — nominal, tanggal, nomor pesanan. `$247.83` bisa menyusut jadi 'some amount'.",
      "Solusinya: tarik fakta transaksional ke **case facts block** yang disuntik ke tiap prompt, **di luar** riwayat yang diringkas. Fakta kritikal jangan pernah lewat proses kompresi.",
      "Ada juga efek **lost in the middle**: info yang ada di tengah konteks paling gampang kelewat. Nggak bisa disembuhin cuma dengan nulis 'tolong perhatikan semuanya'.",
      "Menyimpan hasil tool mentah-mentah karena 'takut nanti butuh' itu bikin konteks cepat penuh dan bikin kualitas turun.",
    ],
    istilah: [
      { term: "progressive summarisation", arti: "meringkas riwayat makin lama makin padat." },
      { term: "case facts block", arti: "blok fakta kunci yang selalu disertakan di tiap prompt." },
      { term: "lost in the middle", arti: "info di bagian tengah konteks paling gampang terlewat." },
    ],
    catat: "Fakta penting (nominal, tanggal, nomor) → taruh di luar ringkasan.",
  },

  "5.2": {
    analogi:
      "Kasus kerusakan ringan bisa diselesaikan sendiri. Kasus yang butuh pengecualian kebijakan — itu urusan atasan.",
    poin: [
      "Eskalasi yang benar itu masuk akal: kasus gampang (kerusakan → penggantian sesuai kebijakan) **diselesaikan sendiri**; kasus yang butuh pengecualian kebijakan **di-eskalasi**.",
      "Kalau kebalik — gampang malah di-eskalasi, ribet malah di-handle sendiri — itu gejala **prompt yang vague**. Fix-nya: kriteria eksplisit + contoh (few-shot).",
      "**Dua pemicu yang nggak reliable**: (a) **sentimen** — pelanggan yang tenang pun bisa punya kasus pengecualian; (b) **confidence score mentah** — model yang salah juga bisa keliatan 'yakin'.",
      "Permintaan eksplisit manusia ('saya mau ngomong sama orang') **langsung dituruti**. Jangan coba diselesaikan dulu.",
      "Kalau ada beberapa kandidat pelanggan yang mirip, jangan asal pilih yang paling baru atau paling aktif. Harus **minta klarifikasi**.",
    ],
    istilah: [
      { term: "escalation", arti: "estafet kasus ke manusia." },
      { term: "sentiment-based escalation", arti: "eskalasi berdasarkan nada emosi — tidak reliable." },
      { term: "confidence score", arti: "angka keyakinan model — harus dikalibrasi dulu." },
      { term: "ambiguous matching", arti: "beberapa kandidat data yang mirip dan membingungkan." },
    ],
    catat: "Eskalasi pakai kriteria eksplisit — bukan sentimen, bukan confidence mentah.",
  },

  "5.3": {
    analogi:
      "Kalau satu sumber gagal, jangan diam-diam dianggap 'datanya nggak ada'. Bilang apa adanya: gagal, nyoba apa, dapet apa, opsi lain apa.",
    poin: [
      "Error di sistem multi-agent harus **di-propagate dengan konteks**: jenis gagalnya apa, query yang dicoba apa, hasil parsial yang sudah didapat, dan opsi pemulihan yang tersedia.",
      "**Dua antipattern:** (a) nangkep timeout lalu balikin hasil kosong yang dibilang 'sukses' → coordinator jadi **buta**; (b) bantai seluruh workflow karena satu sumber timeout → **buang hasil parsial** yang sebenarnya masih berguna.",
      "Yang benar: **recovery lokal dulu** — retry + backoff di level subagent buat error transient — baru propagate yang beneran nggak bisa diselamatkan.",
      "Status generik kayak 'search unavailable' setelah retry habis itu kurang. Coordinator butuh detail biar bisa mutusin langkah alternatif (ganti sumber? catat sebagai gap?).",
      "**Valid empty result** jangan di-retry — itu bukan error, itu datanya memang nggak ada.",
    ],
    istilah: [
      { term: "error propagation", arti: "nyampein error lengkap dengan konteks ke lapisan atas." },
      { term: "partial results", arti: "hasil yang sudah didapat sebelum ada bagian yang gagal." },
      { term: "local recovery", arti: "pemulihan di level subagent (retry + backoff)." },
      { term: "coverage annotation", arti: "catatan bagian mana yang gagal dicakup." },
    ],
    catat: "Error jangan diburamkan: bawa jenis gagal + query + hasil parsial.",
  },

  "5.4": {
    analogi:
      "Kalau lu ngejelajah hutan berjam-jam tanpa nyatet apa pun, lu bakal lupa jalur mana yang udah dilewatin — dan mulai ngarang peta sendiri.",
    poin: [
      "Eksplorasi codebase yang panjang bikin **context degradation**: detail awal memudar, dan agent mulai **mengarang pola umum** yang kedengarannya masuk akal tapi salah.",
      "Gejalanya khas: dia nyebut nama class atau rantai dependency yang sebenarnya nggak ada di kode lu.",
      "Solusinya: **scratchpad file** — catat temuan penting (nama class, dependency chain, keputusan) ke file yang bisa dibaca balik kapan pun. **Memori eksternal** jauh lebih andal daripada memori internal yang kedengaran yakin.",
      "Restart tanpa nyimpen temuan = semua hasil hilang. Gedein context window cuma **nunda** degradasi, bukan nyegah.",
      "Delegasi ke subagent bukan cuma soal paralel — itu juga cara **njaga konteks utama tetap bersih**.",
    ],
    istilah: [
      { term: "context degradation", arti: "kualitas pemahaman turun karena konteks penuh atau detail memudar." },
      { term: "scratchpad", arti: "file catatan temuan yang bisa di-refer balik." },
      { term: "delegasi", arti: "lempar eksplorasi ke subagent biar konteks utama tetap bersih." },
    ],
    catat: "Nyatet ke scratchpad lebih andal daripada ngandelin ingatan konteks.",
  },

  "5.5": {
    analogi:
      "Nilai rata-rata kelas 97% bisa nyembunyiin satu kelas yang nilainya 80-an. Angka agregat itu topeng yang rapi.",
    poin: [
      "**Jebakan metrik agregat**: akurasi rata-rata tinggi (97%) bisa **nyembunyiin** tipe dokumen atau field tertentu yang akurasinya jauh di bawah (80-an).",
      "Confidence score model itu **bukan probabilitas error** yang sebenarnya. Harus **dikalibrasi** dulu terhadap dataset berlabel sebelum dipakai buat mutusin mana yang boleh lewat tanpa review manusia.",
      "Sampling-nya jangan cuma dari yang low-confidence — itu bikin lu buta di area yang keliatan aman. Pakai **stratified random sampling** per tipe dokumen/field.",
      "Prioritas kapasitas reviewer itu **disbar nggak rata** — fokusin ke segmen yang paling berisiko, bukan dibagi rata ke semua.",
      "Automate cuma **setelah** validasi kelar, bukan langsung dari angka mentah.",
    ],
    istilah: [
      { term: "aggregate accuracy", arti: "akurasi rata-rata keseluruhan — bisa nyembunyiin masalah." },
      { term: "calibration", arti: "nyocokin skor keyakinan model dengan hasil nyata." },
      { term: "stratified sampling", arti: "sampling per kelompok, bukan acak dari satu sisi." },
      { term: "reviewer capacity", arti: "kapasitas manusia buat review." },
    ],
    catat: "97% rata-rata bisa nutupin 80% di segmen tertentu. Kalibrasi dulu.",
  },

  "5.6": {
    analogi:
      "Dua sumber kredibel yang beda angka itu lumrah di riset. Yang salah: sistem diam-diam milih satu tanpa bilang kalau ada beda.",
    poin: [
      "Konflik antar sumber itu **normal**. Yang salah: sistem **diam-diam milih satu** (biasanya yang paling baru) dan nggak ngasih tau kalau ada konflik.",
      "Yang benar: tampilkan **KEDUA nilai** plus atribusi sumbernya dan tanggal publikasinya. Ini namanya menjaga **provenance** — jejak asal data.",
      "Jangan juga 'asal rata-ratain' atau bikin nilai gabungan — itu **mengarang angka** yang nggak diklaim sumber mana pun.",
      "Jangan eskalasi setiap konflik ke manusia — konflik itu lumrah, sistem yang harus bisa nyajiin dengan atribusi.",
      "Saat synthesis lewat beberapa langkah, peta **claim → sumber** harus tetap kebawa. Kalau diparafrase tanpa nyimpen mapping-nya, atribusinya ilang di ujung.",
    ],
    istilah: [
      { term: "provenance", arti: "jejak asal-usul data: sumber + tanggal publikasi." },
      { term: "claim-source mapping", arti: "pasangan antara klaim dan sumbernya." },
      { term: "temporal awareness", arti: "ngeh tanggal data biar konteksnya nggak kecampur." },
    ],
    catat: "Konflik data → tampilkan dua-duanya + sumber + tanggal. Jangan milih diam-diam.",
  },
};

export function getTongkrongan(num: string): Tongkrongan | undefined {
  return tongkrongan[num];
}
