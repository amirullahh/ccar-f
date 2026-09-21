/**
 * answer-key.mjs
 * Curated answer key + per-option explanations (Bahasa Indonesia, santai)
 * untuk 27 Practice Scenario CCAR-F. Keyed by task number "X.Y".
 */
export const ANSWER_KEY = {
  "1.1": {
    correct: "B",
    explain: {
      A: "Iteration cap itu safety net doang, bukan alat utama buat ngontrol loop. Kalau task butuh 16 iterasi, agent-nya mati prematur lagi — masalahnya nggak beres.",
      B: "Benar. stop_reason itu satu-satunya sinyal deterministik buat loop control. tool_use = lanjut, end_turn = selesai. Nggak peduli ada teks atau nggak di response-nya.",
      C: "Tool_choice: any maksa Claude selalu manggil tool — pas agent-nya udah beneran beres, dia tetep dipaksa nge-call tool = infinite loop.",
      D: "Parsing kalimat 'gue udah beres' itu ambigu. Claude bisa bilang 'selesai analisis file pertama' padahal masih lanjut file kedua. Natural language bukan sinyal kontrol.",
    },
  },
  "1.2": {
    correct: "D",
    explain: {
      A: "Nggak relevan — semua subagent cuma ngerjain apa yang di-assign. Kalau coordinernya nggak assign geothermal, ya nggak ada yang nulis soal geothermal.",
      B: "Synthesis subagent kerjanya bener: dia gabungin semua yang diterima. Masalahnya bukan di gabungan, tapi di assignment yang cuma solar + wind dari awal.",
      C: "Query search cuma jalan untuk topik yang di-assign coordinator. Kalau subtopiknya cuma solar & wind, query sebagus apa pun nggak bakal nyari geothermal.",
      D: "Benar. Trace failure ke asalnya: coverage gap terjadi karena coordinator decomposition terlalu sempit — geothermal, tidal, biomass, fusion nggak pernah di-assign ke subagent mana pun.",
    },
  },
  "1.3": {
    correct: "B",
    explain: {
      A: "Kasih akses tool langsung ke synthesis agent itu solusi mahal & salah diagnosis — dia nggak bisa nyitir sumber yang nggak pernah dia terima. Perbaiki context passing-nya.",
      B: "Benar. Synthesis agent cuma bisa nyitir metadata yang dikasih coordinator. Kalau URL, nama dokumen, dan nomor halaman dibuang sebelum diterusin, ya report-nya pasti tanpa atribusi.",
      C: "Instruksi 'sitasi sumbernya' nggak guna kalau metadata sumbernya sendiri nggak pernah dikirim. Model nggak bisa mengarang URL yang valid.",
      D: "Dua subagent terbukti kerja dengan benar dan return format yang terstruktur. Masalahnya di coordinator yang strip metadata, bukan di format.",
    },
  },
  "1.4": {
    correct: "B",
    explain: {
      A: "Few-shot itu masih prompt-based = probabilistik. 8% kegagalan bisa turun dikit, tapi tetap ada. Buat duit, 1 kegagalan aja udah rugi.",
      B: "Benar. Prerequisite gate programatik itu deterministik: process_refund fisiknya nggak bisa jalan sebelum get_customer return verified customer ID. Model nggak bisa bypass kode.",
      C: "Perkuat prompt = tetap probabilistik. Data produksi udah ngebuktiin prompt aja gagal 8%. Kasus uang/keamanan/compliance wajib programmatic enforcement.",
      D: "Routing classifier nambah infrastruktur tapi tetap nggak jamin urutan verifikasi → refund. Ini over-engineered, yang dibutuhkan adalah gate sederhana di kode.",
    },
  },
  "1.5": {
    correct: "A",
    explain: {
      A: "Benar. PreToolUse hook bisa nge-deny transfer_funds sampai aml_check return verified pass. Ini enforcement 100% — persis yang diminta compliance team.",
      B: "Prompt + contoh + warning = tetap probabilistik (95%). Compliance butuh 100%, jadi jawaban prompt-based otomatis salah.",
      C: "PostToolUse hook itu ex-post: transfer udah jalan dulu baru di-flag. Buat AML itu udah kejadian pelanggaran — salah urutan.",
      D: "Few-shot lagi-lagi probabilistik. Uang + regulasi = programmatic enforcement, titik.",
    },
  },
  "1.6": {
    correct: "D",
    explain: {
      A: "Sequential batching nambah latency dan nggak nyembuhin inkonsistensi antar file (kode identik disetujui di satu file, di-flag di file lain).",
      B: "Masalahnya bukan size context window, tapi attention dilution: semua file masuk satu pass, perhatiannya menipis di file 10-14.",
      C: "Prompt 'review semua file dengan teliti' itu tetap probabilistik — persis pola yang udah gagal di soal ini.",
      D: "Benar. Pisah jadi per-file local pass (depth konsisten) + cross-file integration pass (data flow & inkonsistensi antar file). Ini resep resmi guide buat attention dilution.",
    },
  },
  "1.7": {
    correct: "C",
    explain: {
      A: "Resume + re-read 3 file doang nggak cukup: history lama masih penuh asumsi yang udah kedaluwarsa (kode yang udah nggak ada).",
      B: "Full re-analyze 50 file dari nol itu boros banget — finding lama yang masih valid ikut kebuang.",
      C: "Benar. Session baru + summary prior findings yang masih relevan + info 3 file yang berubah buat re-analisis ter-target. Efisien dan akurat.",
      D: "fork_session cuma nge-branch history yang sama — history stalenya ikut kebawa, jadi sumber masalah tetap ada.",
    },
  },
  "2.1": {
    correct: "B",
    explain: {
      A: "Few-shot nambah token tanpa ngeroot-cause. Model bingung karena deskripsinya nggak bisa bedain dua tool, bukan karena kurang contoh.",
      B: "Benar. Deskripsi tool adalah mekanisme utama pemilihan tool. Expand dengan format input, contoh query, edge cases, dan boundary ('jangan pakai untuk X — pakai Y') = fix paling murah paling ampuh.",
      C: "Consolidation valid sebagai keputusan arsitektur jangka panjang, tapi overkill sebagai first step. Effort-nya jauh lebih besar dari nulis ulang deskripsi.",
      D: "Routing classifier nge-bypass pemahaman natural language si LLM + nambah infrastruktur. Over-engineered buat masalah deskripsi.",
    },
  },
  "2.2": {
    correct: "D",
    explain: {
      A: "Naikin retry limit malah nambah waste — account-nya memang nggak ada, retry 100 kali pun tetep kosong.",
      B: "Larang retry semua lookup = access failure beneran (DB down) langsung di-eskalasi tanpa di-retry. Salah dua arah.",
      C: "Threshold bukan masalahnya. Yang salah: agent nggak bisa bedain 'query sukses, hasilnya memang kosong' vs 'query gagal'.",
      D: "Benar. Valid empty result ≠ access failure. Structured response-nya harus membedakan: resultCount: 0 + isError: false (jangan retry) vs isError: true + isRetryable: true (DB nggak ke-reach).",
    },
  },
  "2.3": {
    correct: "A",
    explain: {
      A: "Benar. Scoped tool kecil buat lookup sederhana (85% kasus) ngebunuh round trip yang nggak perlu; verifikasi kompleks tetep ke coordinator. Latency turun drastis tanpa ngerusak arsitektur.",
      B: "Ngeskip verifikasi = kualitas riset anjlok. Jangan buang langkah penting demi latensi.",
      C: "Cache ngebantu lookup berulang doang, nggak ngatasin round trip buat lookup pertama-tama tiap fact. Ini partial fix yang nggak nyentuh akar masalah.",
      D: "Paralelisme coordinator nge-speed-up queue, tapi 2-3 round trip per task tetep kejadian. Bukan solusi yang tepat sasaran.",
    },
  },
  "2.4": {
    correct: "A",
    explain: {
      A: "Benar. Community servers dulu — cuma build custom kalau kebutuhan spesifik tim nggak ke-cover. Prinsip guide: low-effort, high-leverage dulu.",
      B: "~/.claude.json itu konfigurasi lokal per-developer, bukan solusi integrasi. Nggak nyambung sama pertanyaan build vs reuse.",
      C: "Raw REST via Bash = redo semuanya manual: auth, error handling, schema. Justru effort paling gede, justru nol integrasi tool yang proper.",
      D: "Build custom sebagai first step = over-engineering. Evaluasi yang udah ada dulu baru build custom kalau memang perlu.",
    },
  },
  "2.5": {
    correct: "C",
    explain: {
      A: "Shell pipeline bisa aja, tapi guide tes apakah lu tahu tool bawaan: Grep buat nyari isi file, Glob buat pola nama file. Jawaban 'sebuah pipeline' nggak nunjukin pemahaman tool.",
      B: "Glob nyari berdasarkan NAMA file. processLegacyOrder itu nama fungsi di dalam kode, bukan nama file — Glob bakal balikin hasil kosong.",
      C: "Benar. Grep processLegacyOrder buat nemuin caller (sekalian nangkep test yang import langsung), lalu Glob sibling test file (**/OrderProcessor.test.*) buat test yang manggil via modul tanpa nyebut nama fungsi. Dua tool bawaan, dua peran yang tepat.",
      D: "Baca SEMUA file manual = bantai context budget & lambat. Justru antipattern yang guide larang.",
    },
  },
  "3.1": {
    correct: "C",
    explain: {
      A: "MCP server itu buat tools, bukan konvensi naming. Nggak nyambung sama skenario.",
      B: ".claude/rules/ itu fitur project-level yang ke-share lewat repo — kalau konvensinya di sana, Dev B juga bakal dapet.",
      C: "Benar. Kalau dua developer di repo & branch yang sama tapi perilaku beda, tersangka utamanya: konvensi disimpen di user-level ~/.claude/CLAUDE.md milik Dev A — cuma mesin Dev A yang ke-load.",
      D: "/memory cuma nampilin config yang ke-load, bukan prasyarat loading. Project CLAUDE.md ke-load otomatis.",
    },
  },
  "3.2": {
    correct: "C",
    explain: {
      A: "Copy-paste manual ke tiap mesin = resep gagal. Team commands harusnya ship bareng repo.",
      B: "Brainstorm itu skill personal, bukan tim. Dan output verbose butuh context: fork biar nggak nutupin main conversation.",
      C: "Benar. /review = tim → .claude/commands/ (ikut repo). /brainstorm = personal → ~/.claude/skills/brainstorm/SKILL.md + frontmatter context: fork buat isolasi output panjang.",
      D: "Slash command itu bukan prosedur di CLAUDE.md — dan skills itu nggak cuma soal allowed-tools.",
    },
  },
  "3.3": {
    correct: "B",
    explain: {
      A: "Root CLAUDE.md ke-load di SEMUA sesi — test conventions numpuk di konteks pas ngeredit file non-test. Boros token.",
      B: "Benar. Satu rule file di .claude/rules/ dengan frontmatter paths: [\"**/*.test.tsx\", \"**/*.test.ts\"] — ke-load cuma pas nyentuh file test, ke-manage di satu tempat, work di seluruh 50+ direktori.",
      C: "Copy-paste CLAUDE.md ke puluhan direktori = maintenance nightmare. Satu perubahan = edit belasan file.",
      D: "Skill harus di-invoke manual — gampang kelewat. Konvensi wajib itu bukan tempatnya di skill.",
    },
  },
  "3.4": {
    correct: "A",
    explain: {
      A: "Benar. (1) restrukturisasi monolith & (3) migrasi 30 file = arsitektur besar & multi-file → plan mode. (2) NPE satu fungsi dengan stack trace jelas → langsung eksekusi aja.",
      B: "Plan mode buat fix NPE satu baris = buang waktu. Sesuain mode sama kompleksitas.",
      C: "Langsung eksekusi buat restrukturisasi monolith? Di situ rencana justru paling dibutuhkan.",
      D: "Migrasi library ke 30 file juga butuh rencana — urutan, dependensi, verifikasi. Jangan cuma yang nomor satu.",
    },
  },
  "3.5": {
    correct: "A",
    explain: {
      A: "Benar. Prosa ambigu itu sumber inkonsistensi. 2-3 contoh input/output konkret = determinis, murah, langsung ngepin behavior. Ladder guide: contoh dulu, baru test suite, baru interview pattern.",
      B: "Test suite itu rung kedua — bagus buat regresi, tapi pertama-tama coba contoh konkret dulu karena effort-nya paling kecil.",
      C: "Interview pattern buat ngejelasin requirement yang kurang konteks. Di sini requirement-nya jelas, cuma ambigu bentuknya — contoh lebih tepat.",
      D: "Prosa yang lebih presisi = tetap prosa. Model tetep bisa interpretasi beda-beda tiap run.",
    },
  },
  "3.6": {
    correct: "C",
    explain: {
      A: "CLAUDE_HEADLESS itu variabel env karangan — nggak ada di Claude Code.",
      B: "--batch itu flag karangan juga. Claude Code nggak punya flag segitu.",
      C: "Benar. Flag -p (print mode) itu cara resmi jalanin Claude Code non-interactive di CI: prompt diproses, output ke stdout, nggak nunggu input.",
      D: "Redirect /dev/null cuma nutup stdin — Claude Code tetep nunggu/atau error. Mode non-interactive-nya harus di-enable eksplisit.",
    },
  },
  "4.1": {
    correct: "A",
    explain: {
      A: "Benar. 40% false positive di satu kategori ngeracunin trust ke SEMUA kategori — dev jadi nge-absahkan security finding yang beneran penting. Matiin kategori noisy selagi diperbaiki = protect trust dulu.",
      B: "Temperature naik + filter voting = mahal, rumit, dan nggak nyentuh root cause (kriteria 'documentation mismatch' yang lemah).",
      C: "Second pass nambah biaya & latency tiap run; yang dibutuhkan: matiin sumber noise selagi kriterianya dibenerin. Ini solusi pertama yang paling cepat ngembalikan trust.",
      D: "'Hanya report high-confidence' itu persis kalimat vague yang guide larang — nggak ada decision boundary yang bisa ditindaklanjuti model.",
    },
  },
  "4.2": {
    correct: "C",
    explain: {
      A: "Pre-processing naratif → tabel = effort infra besar buat masalah yang bisa diselesaikan di level prompt.",
      B: "Konteks bukan masalahnya — info ADA di dokumen, model cuma gagal ngenalin polanya di format naratif.",
      C: "Benar. Few-shot dengan contoh dari KEDUA format (tabel & naratif) ngepin pattern extraction. Ini first step termurah & paling ngefek.",
      D: "Retry field kosong = nambah biaya & tetep sering gagal di dokumen yang sama. Perbaiki pemahaman modelnya, bukan bolak-balik doang.",
    },
  },
  "4.3": {
    correct: "A",
    explain: {
      A: "Benar. Kalau semua field wajib, model DIPAKSA ngisi — datanya nggak ada, ya dia ngarang. Field opsional/nullable ngasih jalan keluar yang jujur.",
      B: "Pindah ke prompt-based JSON justru nambah risiko halusinasi — tool_use schema itu yang paling ketat.",
      C: "'Jangan ngarang' tanpa jalan keluar di schema = model tetep dipaksa ngisi field wajib. Instruksi kalah sama struktur.",
      D: "Validasi post-hoc ngedeteksi halusinasi, tapi nggak nyegah — pipeline jadi retry terus. Akar masalahnya di schema.",
    },
  },
  "4.4": {
    correct: "C",
    explain: {
      A: "Doc B (field nggak ada di source) nggak mungkin ke-retry — model bakal ngarang department buat ngebantu validasi. Salah dua-duanya.",
      B: "Doc A bisa dibenerin otomatis (sum mismatch = selisih £50, kasih feedback buat re-extract). Buang-buang human review.",
      C: "Benar. Doc A: mismatch jumlah = validasi bisa kepulihin → retry dengan error spesifik. Doc B: informasi beneran absen dari source → nggak ada yang bisa di-retry → human review.",
      D: "'Coba-coba lagi karena non-deterministik' = lottery, bukan strategi. Doc B bakal gagal terus, Doc A butuh feedback spesifik.",
    },
  },
  "4.5": {
    correct: "A",
    explain: {
      A: "Benar. Batch API = 50% lebih murah tapi hasil dateng dalam jam-jam. Debt report overnight? Cocok. Pre-merge check yang blocking? Wajib real-time — developer nggak mau nunggu berjam-jam buat merge.",
      B: "Batch + fallback timeout = kompleksitas ekstra dan pre-merge tetep kena delay pas batch-nya slow. Nggak worth it buat workflow blocking.",
      C: "Real-time buat debt report overnight = bayar full price buat job yang nggak deadline. Buang-buang uang.",
      D: "Status polling nggak ngubah satu hal pun: batch tetep butuh jam-jam. Pre-merge blocking tetep kena.",
    },
  },
  "4.6": {
    correct: "B",
    explain: {
      A: "Model lebih gede = attention dilution tetep kejadian. Persis pola 1.6: konteks kebanyakan bikin perhatian menipis.",
      B: "Benar. Per-file local pass buat depth yang konsisten + cross-file integration pass buat data flow & finding kontradiktif. Ini resep multi-pass review yang disarankan guide.",
      C: "Voting 3 run full-PR = 3x biaya dan attention dilution kejadian di ketiga-tiganya. Mahal & tetep inconsistent.",
      D: "Nyerahkan beban ke developer (pecahin PR manual) = nggak nyekrup sistemnya. Sistem review-nya yang harus diperbaiki.",
    },
  },
  "5.1": {
    correct: "B",
    explain: {
      A: "Instruksi 'jaga angka-angka' di summary = tetap probabilistik. Summary compress, angka bakal hilang di suatu titik — dan itu refund $247.83, bukan angka yang boleh hilang.",
      B: "Benar. Ekstrak fakta transaksional (amount, tanggal, order #) ke case facts block yang DI-INCLUDE di tiap prompt, di luar history yang disummarise. Fakta kritikal nggak pernah lewat summarization.",
      C: "Retrieve-on-demand nambah latency & retrieval bisa gagal pas paling dibutuhkan. Fakta yang diketahui kritikal itu dimasukin eksplisit, bukan dicari-cari.",
      D: "Window lebih gede cuma nunda masalah — percakapan panjang tetep melewati batas. Dan cost per call naik.",
    },
  },
  "5.2": {
    correct: "A",
    explain: {
      A: "Benar. Kriteria eskalasi eksplisit (damage replacement = resolve; policy exception = escalate) + few-shot contoh = decision boundary yang bisa ditindaklanjuti. Inverted escalation dibenerin langsung.",
      B: "Classifier terpisah = infrastruktur baru + harus dilatih + maintenance. Over-engineered sebelum kriteria eksplisit dicoba.",
      C: "Sentiment bukan tanda kompleksitas — customer tenang pun bisa punya policy exception yang harusnya di-eskalasi.",
      D: "Self-reported confidence itu kalibrasi yang buruk — model yang salah juga bisa 'yakin'. Ini persis kalimat vague yang guide larang.",
    },
  },
  "5.3": {
    correct: "C",
    explain: {
      A: "Empty-but-successful = koordinator buta. Dia ngira riset kelar padahal satu sumber gagal — silently suppressing error, antipattern eksplisit.",
      B: "Terminate semua workflow karena satu timeout = buang partial results dari sumber yang sukses. Over-reaction.",
      C: "Benar. Structured error context: failure type + attempted query + partial results + alternative approaches. Koordinator jadi bisa milih recovery cerdas (retry? sumber lain? catat gap?).",
      D: "Retry + backoff bagus di level subagent, tapi status generik 'search unavailable' setelah semua retry = koordinator nggak dapet konteks buat recover dengan cerdas.",
    },
  },
  "5.4": {
    correct: "B",
    explain: {
      A: "Window gede nunda degradasi, nggak nyegah. Exploration panjang tetep bikin detail awal memudar.",
      B: "Benar. Scratchpad file yang nyatet temuan kunci (nama class, dependency chain) = memori eksternal yang bisa di-refer kapan pun. Detail nggak ikut memudar bareng konteks.",
      C: "Restart + 'coba lebih efisien' = semua temuan hilang & nggak ada jaminan lebih baik.",
      D: "Pre-load seluruh struktur = bantai context budget di awal; detail isi class tetep harus di-explore. Justru mpercepat penuhnya konteks.",
    },
  },
  "5.5": {
    correct: "D",
    explain: {
      A: "'Review semua' = nggak efisien juga, tapi bukan itu critical risk-nya. Confusion-based routing itu praktik standar — yang salah di sini adalah angka 95% yang dipakai mentah-mentah.",
      B: "Threshold 99% juga bakal salah kalau skornya nggak dikalibrasi. Angka mentah confidence bukan probabilitas error sebenarnya.",
      C: "Overconfidence-over-time itu spekulasi; yang terukur dan langsung di soal ini: agregat 97% nutupin performa per-tipe-dokumen.",
      D: "Benar. Akurasi agregat 97% bisa nyembunyiin tipe dokumen/field tertentu yang akurasinya 80-an. Confidence score harus dikalibrasi dulu terhadap labelled validation set sebelum jadi dasar skip review.",
    },
  },
  "5.6": {
    correct: "D",
    explain: {
      A: "Eskalasi tiap konflik data = human bottleneck. Konflik antar sumber itu normal di riset — sistem harusnya bisa nanganin dengan atribusi.",
      B: "Ngasih rata-rata 12% & 8% = ngarang angka yang nggak diklaim sumber mana pun. Fabrication halus.",
      C: "Langganan terbaru bisa aja salah metodologi — dan nilainya beda konteks (2023 vs 2024). Sekali lagi: memilih diam-diam = nyembunyiin konflik.",
      D: "Benar. Annotate kedua nilai + atribusi + tanggal publikasi = provenance utuh. Konsumen laporan bisa nilain sendiri. Provenance = transparansi, bukan pemilihan senyap.",
    },
  },
};
