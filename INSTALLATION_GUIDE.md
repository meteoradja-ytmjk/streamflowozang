# Panduan Instalasi Tab Schedule di Modal Stream

## Ringkasan Perubahan
Modifikasi ini menambahkan sistem tab di dalam modal "Create New Stream" untuk memisahkan konfigurasi Stream dan Schedule, membuat UI lebih efisien dan terorganisir.

## File yang Dibuat
1. `public/js/stream-modal-tabs.js` - Logic untuk tab management
2. `public/css/stream-modal-tabs.css` - Styling untuk tab system
3. `stream-modal-tab-implementation.html` - Contoh implementasi lengkap
4. `STREAM_MODAL_TAB_MODIFICATION.md` - Dokumentasi detail
5. `INSTALLATION_GUIDE.md` - Panduan ini

## Langkah Instalasi

### Langkah 1: Tambahkan File CSS dan JS

Tambahkan link ke file CSS dan JS di bagian `<head>` atau sebelum `</body>` di file `views/layout.ejs` atau `views/dashboard.ejs`:

```html
<!-- Tambahkan di bagian head atau sebelum closing body tag -->
<link rel="stylesheet" href="/css/stream-modal-tabs.css">
<script src="/js/stream-modal-tabs.js"></script>
```

### Langkah 2: Backup File Dashboard

Sebelum melakukan perubahan, backup file dashboard.ejs:

```bash
copy views\dashboard.ejs views\dashboard.ejs.backup
```

### Langkah 3: Modifikasi Modal Stream

Buka file `views/dashboard.ejs` dan cari bagian `<div id="newStreamModal">`.

Ganti seluruh struktur modal dengan struktur yang ada di file `stream-modal-tab-implementation.html`.

**Poin Penting:**
- Pastikan semua ID element tetap sama
- Jangan hapus fungsi JavaScript yang sudah ada
- Hanya ubah struktur HTML modal

### Langkah 4: Update Fungsi openNewStreamModal

Cari fungsi `openNewStreamModal()` di dashboard.ejs dan update menjadi:

```javascript
function openNewStreamModal() {
  const modal = document.getElementById('newStreamModal');
  document.body.style.overflow = 'hidden';
  modal.classList.remove('hidden');
  
  // Initialize tabs - TAMBAHKAN BARIS INI
  if (typeof initStreamModalTabs === 'function') {
    initStreamModalTabs();
  }
  
  const advancedSettingsContent = document.getElementById('advancedSettingsContent');
  const advancedSettingsToggle = document.getElementById('advancedSettingsToggle');
  if (advancedSettingsContent && advancedSettingsToggle) {
    advancedSettingsContent.classList.add('hidden');
    const icon = advancedSettingsToggle.querySelector('i');
    if (icon) icon.style.transform = '';
  }
  
  requestAnimationFrame(() => {
    modal.classList.add('active');
  });
  
  loadGalleryVideos();
}
```

### Langkah 5: Tambahkan Fungsi setQuickSchedule

Tambahkan fungsi ini di bagian script dashboard.ejs:

```javascript
// Quick schedule preset
function setQuickSchedule(minutes) {
  const durationInput = document.getElementById('duration');
  if (durationInput) {
    durationInput.value = minutes;
    
    // Visual feedback
    durationInput.classList.add('border-green-500');
    setTimeout(() => {
      durationInput.classList.remove('border-green-500');
      durationInput.classList.add('border-gray-600');
    }, 1000);
  }
}
```

### Langkah 6: Update Form Submit Handler

Cari bagian form submit handler dan pastikan mengambil data dari field schedule yang baru:

```javascript
document.getElementById('newStreamForm').addEventListener('submit', function (e) {
  e.preventDefault();
  
  const videoId = document.getElementById('selectedVideoId').value;
  if (!videoId) {
    // Switch to stream tab to show error
    if (typeof switchStreamTab === 'function') {
      switchStreamTab('stream');
    }
    alert('Please select a video before creating the stream');
    return;
  }
  
  // ... existing validation code ...
  
  const formData = {
    streamTitle: document.getElementById('streamTitle').value,
    videoId: document.getElementById('selectedVideoId').value,
    audioId: document.getElementById('selectedAudioId')?.value || null,
    rtmpUrl: document.getElementById('rtmpUrl').value,
    streamKey: document.getElementById('streamKey').value,
    bitrate: document.querySelector('select[name="bitrate"]').value,
    fps: document.querySelector('select[name="fps"]').value,
    loopVideo: document.querySelector('input[name="loopVideo"]').checked,
    orientation: currentOrientation,
    resolution: document.getElementById('currentResolution').textContent.split(' ')[0],
    useAdvancedSettings: !document.getElementById('advancedSettingsContent').classList.contains('hidden')
  };
  
  // Get schedule data - PASTIKAN MENGGUNAKAN ID YANG BENAR
  const scheduleTime = document.getElementById('scheduleTime')?.value;
  const duration = document.getElementById('duration')?.value;
  
  if (scheduleTime) {
    formData.scheduleTime = scheduleTime;
  }
  if (duration) {
    formData.duration = parseInt(duration);
  }
  
  // ... existing submit code ...
});
```

### Langkah 7: Testing

1. Restart aplikasi Node.js:
   ```bash
   npm start
   ```

2. Buka browser dan akses dashboard

3. Klik tombol "New Stream"

4. Verifikasi:
   - Tab "Stream Configuration" aktif secara default
   - Klik tab "Schedule Settings" dan pastikan konten berubah
   - Isi form di tab Stream Configuration
   - Pindah ke tab Schedule Settings dan isi schedule
   - Submit form dan pastikan data tersimpan

5. Test berbagai skenario:
   - Stream immediate (tanpa schedule)
   - Stream scheduled (dengan waktu mulai)
   - Stream dengan duration
   - Stream tanpa duration
   - Quick preset buttons

## Troubleshooting

### Tab tidak berfungsi
- Pastikan file `stream-modal-tabs.js` sudah di-load
- Check console browser untuk error JavaScript
- Pastikan fungsi `switchStreamTab` tersedia di global scope

### Styling tidak muncul
- Pastikan file `stream-modal-tabs.css` sudah di-load
- Clear browser cache
- Check path file CSS sudah benar

### Form submit tidak mengambil data schedule
- Pastikan ID element schedule sama dengan yang di handler
- Check console untuk error
- Pastikan field schedule ada di DOM saat submit

### Modal tidak muncul setelah modifikasi
- Restore dari backup: `copy views\dashboard.ejs.backup views\dashboard.ejs`
- Periksa syntax HTML, pastikan tidak ada tag yang tidak tertutup
- Check console browser untuk error

## Rollback

Jika terjadi masalah dan ingin kembali ke versi sebelumnya:

```bash
copy views\dashboard.ejs.backup views\dashboard.ejs
```

Kemudian restart aplikasi.

## Fitur Tambahan yang Bisa Dikembangkan

1. **Recurring Schedule**: Tambahkan opsi untuk schedule berulang (daily, weekly)
2. **Schedule Template**: Simpan konfigurasi schedule sebagai template
3. **Calendar View**: Tampilkan schedule dalam bentuk kalender
4. **Validation**: Tambahkan validasi waktu (tidak bisa schedule di masa lalu)
5. **Timezone Support**: Tambahkan pilihan timezone

## Support

Jika mengalami kesulitan, periksa:
1. Console browser untuk error JavaScript
2. Network tab untuk memastikan file CSS/JS ter-load
3. Element inspector untuk memastikan struktur HTML benar

## Kesimpulan

Setelah instalasi selesai, Anda akan memiliki:
- Modal stream dengan 2 tab yang terpisah
- UI yang lebih bersih dan terorganisir
- User experience yang lebih baik
- Kemudahan untuk menambahkan fitur baru di masa depan

Selamat menggunakan fitur tab schedule yang baru! 🎉
