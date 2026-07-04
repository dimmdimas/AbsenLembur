import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { Button, Gap, Input, Label, Signature, TimeInput } from "../components";

export default function Page() {
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [found, setFound] = useState(true)
  const [isNik, setIsNIK] = useState(false)
  const [tandaTanganBase64, setTandaTanganBase64] = useState('');
  const [tanggalDay1, setTanggalDay1] = useState('');
  const [tanggalDay2, setTanggalDay2] = useState('');
  const [jabatan, setJabatan] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [lockStartDay1, setLockStartDay1] = useState(false);
  const [lockStartDay2, setLockStartDay2] = useState(false);

  // --- STATE BARU UNTUK TIDAK IKUT LEMBUR ---
  const [tidakIkutDay1, setTidakIkutDay1] = useState(false);
  const [tidakIkutDay2, setTidakIkutDay2] = useState(false);

  const [isSudahDay1, setIsSudahDay1] = useState(false);
  const [isSudahDay2, setIsSudahDay2] = useState(false);

  // State untuk me-refresh komponen Tanda Tangan
  const [resetKey, setResetKey] = useState(0);
  const [isTidakWajib, setIsTidakWajib] = useState(false);

  // State untuk errorMsg
  const [errorMessage, setErrorMessage] = useState('');

  const [isApprovalOnly, setIsApprovalOnly] = useState(false);
  const NIK_OSH = "10038106";     // Ganti dengan NIK asli OSH
  const NIK_MANAGER = "10000224"; // Ganti dengan NIK asli Manager
  const NIK_MANAGER2 = "10005544"; 
  const NIK_HRD = "10003315";     // Ganti dengan NIK asli HRD

  // File Excel
  const [fileExcel, setFileExcel] = useState<DocumentPicker.DocumentPickerAsset | null>(null);

  const [waktuDay1, setWaktuDay1] = useState({
    startJam: '', startMenit: '',
    endJam: '', endMenit: ''
  });

  const [waktuDay2, setWaktuDay2] = useState({
    startJam: '', startMenit: '',
    endJam: '', endMenit: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      // --- PROSES DAY 1 ---
      const res1 = await AmbilTanggalDay('day1');
      if (res1 && res1.tanggal) {
        setTanggalDay1(res1.tanggal);
        if (res1.jam16 === true || res1.jam16 === "true") {
          setWaktuDay1({ startJam: '16', startMenit: '00', endJam: '', endMenit: '', });
          setLockStartDay1(true); // <--- TAMBAHKAN INI
        } else if (res1.jam12 === true || res1.jam12 === "true") {
          setWaktuDay1({ startJam: '12', startMenit: '00', endJam: '', endMenit: '', });
          setLockStartDay1(true); // <--- TAMBAHKAN INI
        }
      } else {
        setTanggalDay1('');
      }

      // --- PROSES DAY 2 ---
      const res2 = await AmbilTanggalDay('day2');
      if (res2 && res2.tanggal) {
        setTanggalDay2(res2.tanggal);
        if (res2.jam16 === true || res2.jam16 === "true") {
          setWaktuDay2({ startJam: '16', startMenit: '00', endJam: '', endMenit: '' });
          setLockStartDay2(true); // <--- TAMBAHKAN INI
        } else if (res2.jam12 === true || res2.jam12 === "true") {
          setWaktuDay2({ startJam: '12', startMenit: '00', endJam: '', endMenit: '' });
          setLockStartDay2(true); // <--- TAMBAHKAN INI
        }
      } else {
        setTanggalDay2('');
      }
    };

    fetchData();
  }, []);

  const CariNIK = async () => {
    if (!nik) {
      setErrorMessage("Silakan masukkan NIK terlebih dahulu");
      return;
    }

    setIsSudahDay1(false);
    setIsSudahDay2(false);
    setErrorMessage('');
    setIsTidakWajib(false);

    try {
      // 1. CARI DATA KARYAWAN
      const urlInfo = `https://api.muhdimas.my.id/api/users/${nik}`;
      const responseInfo = await fetch(urlInfo);
      const dataInfo = await responseInfo.json();

      if (responseInfo.ok) {

        // 2. CEK APAKAH NIK ADA DI COLLECTION 'list_users'
        const urlWajib = `https://api.muhdimas.my.id/api/cek-wajib-absen/${nik}`;
        const responseWajib = await fetch(urlWajib);

        // --- LOGIKA BARU: Cek apakah NIK ini adalah barisan Approval ---
        const isApprover = nik === NIK_OSH || nik === NIK_MANAGER || nik === NIK_MANAGER2 || nik === NIK_HRD;

        // JIKA ADA DI LIST_USERS **ATAU** DIA ADALAH APPROVER
        if (responseWajib.ok || isApprover) {

          setFound(true);
          setIsNIK(true);
          setNama(dataInfo.nama);
          setJabatan(dataInfo.jabatan);
          setErrorMessage('');
          setIsTidakWajib(false); // Pastikan status blokir dimatikan

          // 3. CEK STATUS ABSEN DAY 1 & DAY 2
          const statusRes = await fetch(`https://api.muhdimas.my.id/api/users/cek-absen/${nik}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setIsSudahDay1(statusData.day1);
            setIsSudahDay2(statusData.day2);
          }

        } else {
          // JIKA TIDAK ADA DI LIST_USERS DAN BUKAN APPROVER: Tampilkan Kotak Oranye
          setNama(dataInfo.nama);
          setJabatan(dataInfo.jabatan);

          // PERBAIKAN: found HARUS true agar UI di bawah Nama (termasuk kotak oranye) bisa dirender!
          setFound(true);
          setIsNIK(true); // Label NIK tetap normal
          setIsTidakWajib(true); // Aktifkan mode kotak oranye

          setErrorMessage(''); // Kosongkan error merah di atas agar tidak dobel dengan kotak oranye
        }

      } else {
        // JIKA NIK SAMA SEKALI TIDAK ADA DI DATABASE KARYAWAN UMUM
        setNama('');
        setJabatan('');
        setFound(false);
        setIsNIK(false);
        setErrorMessage('⚠️ NIK tidak ditemukan di database karyawan.');
      }
    } catch (error) {
      console.error(error);
      setErrorMessage("Gagal terhubung ke server database.");
    }
  }

  const AmbilTanggalDay = async (day: string) => {
    try {
      const response = await fetch(`https://api.muhdimas.my.id/api/date?targetDay=${day}`);
      if (!response.ok) return null;
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  const handleWaktuChange = (day: 'day1' | 'day2', field: string, value: string) => {
    if (day === 'day1') {
      setWaktuDay1(prev => ({ ...prev, [field]: value }));
    } else {
      setWaktuDay2(prev => ({ ...prev, [field]: value }));
    }
  };

  const isMinimal4Jam = (waktu: any) => {
    const sH = parseInt(waktu.startJam || "0");
    const sM = parseInt(waktu.startMenit || "0");
    const eH = parseInt(waktu.endJam || "0");
    const eM = parseInt(waktu.endMenit || "0");

    const mulai = (sH * 3600) + (sM * 60);
    const selesai = (eH * 3600) + (eM * 60);

    let selisih = selesai - mulai;
    if (selisih < 0) {
      selisih += 24 * 3600;
    }

    if (mulai > selesai) { return false };

    return selisih >= (4 * 3600);
  };

  const hideTimeInput = nik === NIK_MANAGER || nik === NIK_MANAGER2 || nik === NIK_HRD || (nik === NIK_OSH && isApprovalOnly);

  const handlePickExcel = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        // Membatasi hanya file excel yang bisa dipilih
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setFileExcel(result.assets[0]);
      }
    } catch (error) {
      console.log("Error picking file:", error);
      alert("Gagal memilih file");
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    // 1. Validasi Dasar
    if (!nik || !nama) return alert("Harap isi NIK dan Nama terlebih dahulu!");
    if (!tandaTanganBase64) return alert("Harap isi Tanda Tangan terlebih dahulu!");

    // VALIDASI BARU: Cek apakah file excel sudah diupload
    if (!hideTimeInput) {
      if (!fileExcel) return alert("Harap upload file Excel terlebih dahulu!");
    }

    // --- Validasi Day 1 ---
    if (tanggalDay1 !== '') {
      if (!tidakIkutDay1 && !hideTimeInput) {
        if (!waktuDay1.endJam || waktuDay1.endJam === '') return alert("Jam pulang Day 1 belum diisi!");
        if (!isMinimal4Jam(waktuDay1)) return alert(`⚠️ Lembur pada ${tanggalDay1} kurang dari 4 jam!`);
      }
    }

    // --- Validasi Day 2 ---
    if (tanggalDay2 !== '') {
      if (!tidakIkutDay2 && !hideTimeInput) {
        if (!waktuDay2.endJam || waktuDay2.endJam === '') return alert("Jam pulang Day 2 belum diisi!");
        if (!isMinimal4Jam(waktuDay2)) return alert(`⚠️ Lembur pada ${tanggalDay2} kurang dari 4 jam!`);
      }
    }

    let pesanSukses = "";
    const url = 'https://api.muhdimas.my.id/api/absen';
    setIsLoading(true);

    // Fungsi helper untuk merakit FormData
    const createFormData = (
      payloadData: { startJam?: string; startMenit?: string; endJam?: string; endMenit?: string },
      targetDayValue: string
    ) => {
      const formData = new FormData();

      formData.append('nik', nik);
      formData.append('nama', nama);
      formData.append('jabatan', jabatan);
      formData.append('tandaTangan', tandaTanganBase64);
      formData.append('targetDay', targetDayValue);
      formData.append('isApprovalMode', String(hideTimeInput));

      formData.append('startJam', payloadData.startJam || '00');
      formData.append('startMenit', payloadData.startMenit || '00');
      formData.append('endJam', payloadData.endJam || '00');
      formData.append('endMenit', payloadData.endMenit || '00');

      // 2. Gunakan "as any" untuk membypass aturan strict Blob bawaan TypeScript
      if (fileExcel) {
        formData.append('fileExcel', {
          uri: fileExcel.uri,
          name: fileExcel.name,
          type: fileExcel.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        } as any);
      }

      return formData;
    };

    try {
      // 2. Kirim data Day 1
      if (tanggalDay1 !== '') {
        const payloadDay1 = (tidakIkutDay1 || hideTimeInput)
          ? { startJam: '00', startMenit: '00', endJam: '00', endMenit: '00' }
          : waktuDay1;

        const formData1 = createFormData(payloadDay1, 'day1');

        const response1 = await fetch(url, {
          method: 'POST',
          // Ingat: JANGAN set 'Content-Type': 'multipart/form-data' secara manual di fetch React Native, 
          // biarkan browser/RN yang set boundary-nya otomatis.
          body: formData1
        });

        if (response1.ok) {
          pesanSukses += `✅ Absen Day 1 Tersimpan ${tidakIkutDay1 ? '(Tidak Ikut)' : ''}\n`;
          setIsSudahDay1(true);
        }
      }

      // 3. Kirim data Day 2
      if (tanggalDay2 !== '') {
        const payloadDay2 = (tidakIkutDay2 || hideTimeInput)
          ? { startJam: '00', startMenit: '00', endJam: '00', endMenit: '00' }
          : waktuDay2;

        const formData2 = createFormData(payloadDay2, 'day2');

        const response2 = await fetch(url, {
          method: 'POST',
          body: formData2
        });

        if (response2.ok) {
          pesanSukses += `✅ Absen Day 2 Tersimpan ${tidakIkutDay2 ? '(Tidak Ikut)' : ''}`;
          setIsSudahDay2(true);
        }
      }

      if (pesanSukses !== "") {
        alert("Berhasil!\n" + pesanSukses);

        // Reset Form
        setNik('');
        setNama('');
        setJabatan('');
        setFound(false);
        setIsNIK(false);
        setTandaTanganBase64('');
        setTidakIkutDay1(false);
        setTidakIkutDay2(false);
        setFileExcel(null); // <--- Hapus file yang sudah dipilih
        setWaktuDay1(prev => ({ ...prev, endJam: '', endMenit: '' }));
        setWaktuDay2(prev => ({ ...prev, endJam: '', endMenit: '' }));
        setResetKey(prevKey => prevKey + 1);
      } else {
        alert("Tidak ada data hari lembur yang dikirim.");
      }
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan saat mengirim data.");
    } finally {
      setIsLoading(false);
    }
  }

  // Form lanjutan HANYA muncul jika ditemukan, DAN wajib absen, DAN belum absen
  const tampilkanFormLanjutan = found && !isTidakWajib && ((tanggalDay1 !== '' && !isSudahDay1) || (tanggalDay2 !== '' && !isSudahDay2));

  const tanggalAktif = [tanggalDay1, tanggalDay2].filter(tgl => tgl !== '').join(' & ');

  const tanggalSelesaiArr = [];
  if (tanggalDay1 !== '' && isSudahDay1) tanggalSelesaiArr.push(tanggalDay1);
  if (tanggalDay2 !== '' && isSudahDay2) tanggalSelesaiArr.push(tanggalDay2);
  const teksTanggalSelesai = tanggalSelesaiArr.join(' & ');

  // --- TAMBAHKAN KODE INI DI SINI ---
  const tanggalApprovalArr = [];
  if (tanggalDay1 !== '' && !isSudahDay1) tanggalApprovalArr.push(tanggalDay1);
  if (tanggalDay2 !== '' && !isSudahDay2) tanggalApprovalArr.push(tanggalDay2);
  const teksTanggalApproval = tanggalApprovalArr.join(' & ');

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.THello}>Hello 👋🏻, Gardira</Text>
        <Text>⚠️ Mohon isi sesuai absen di Fiory / Sap Portal ⚠️</Text>

        <Gap height={23} />
        <Label text="NIK" status={isNik} user={found} />
        <View style={styles.containerNIK}>
          <Input value={nik} onChangeText={(text) => {
            setNik(text);
            // setFound(false);
            setIsNIK(false);
            setErrorMessage('');
          }} />
          <Button label="Enter" onPress={CariNIK} />
        </View>
        {errorMessage !== '' && (
          <View style={styles.boxError}>
            <Text style={styles.textError}>{errorMessage}</Text>
          </View>
        )}
        <Gap height={20} />
        <Label text="Nama" />
        <Input value={nama} onChangeText={setNama} jabatan={jabatan} editable={false} />

        {/* --- LOGIKA TAMPILAN DIMULAI DARI SINI --- */}
        {found && (
          <View style={{ marginTop: 20 }}>
            {isTidakWajib ? (
              // 1. TAMPILAN JIKA TIDAK ADA DI LIST_USERS (Kotak Peringatan)
              <View style={[styles.boxSudahAbsen, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }]}>
                <Text style={[styles.textSudahAbsen, { color: '#E65100', textAlign: 'center' }]}>
                  ⛔ Anda tidak terdaftar dalam jadwal wajib lembur untuk tanggal {tanggalAktif}.
                </Text>
              </View>
            ) : (
              // 2. TAMPILAN JIKA NORMAL & WAJIB ABSEN (Form Asli Anda)
              <View>

                {/* --- KOTAK HIJAU DINAMIS (Muncul jika ada tanggal yang sudah diabsen) --- */}
                {teksTanggalSelesai !== '' && (
                  <View style={[styles.boxSudahAbsen, { marginBottom: 15 }]}>
                    <Text style={[styles.textSudahAbsen, { textAlign: 'center' }]}>
                      ✅ Anda sudah mengisi absen lembur untuk tanggal {teksTanggalSelesai}.
                    </Text>
                  </View>
                )}

                {/* --- TAMBAHAN 4A: TOMBOL KHUSUS OSH --- */}
                {nik === NIK_OSH && (
                  <View style={{ marginBottom: 15 }}>
                    <Button
                      label={isApprovalOnly ? "✅ Mode: Hanya Approval" : "📝 Mode: Ikut Lembur"}
                      onPress={() => setIsApprovalOnly(!isApprovalOnly)}
                    />
                    <Text style={{ fontSize: 12, color: 'gray', textAlign: 'center', marginTop: 5 }}>
                      Klik tombol di atas untuk mengubah mode
                    </Text>
                  </View>
                )}

                {/* --- TAMBAHAN 4B: JIKA MANAGER/HRD/OSH(Approval) --- */}
                {hideTimeInput && tampilkanFormLanjutan ? (
                  <View style={{ padding: 15, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#1565C0', fontSize: 16 }}>
                      Mode Approval Aktif
                    </Text>
                    {/* --- TAMBAHAN TANGGAL DI SINI --- */}
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#1565C0', fontSize: 14, marginTop: 5 }}>
                      Tanggal: {teksTanggalApproval}
                    </Text>
                    {/* ------------------------------- */}
                    <Text style={{ textAlign: 'center', color: '#1565C0', fontSize: 13, marginTop: 5 }}>
                      Jam lembur & File Upload disembunyikan. Silakan langsung berikan tanda tangan Anda di bawah.
                    </Text>
                  </View>
                ) : (
                  // JIKA BUKAN MODE APPROVAL, TAMPILKAN FORM JAM SEPERTI BIASA
                  <View>
                    {/* --- TAMPILAN DAY 1 (Hanya muncul jika Day 1 ADA dan BELUM diabsen) --- */}
                    {tanggalDay1 !== '' && !isSudahDay1 && (
                      <View style={{ marginTop: 10 }}>
                        <View style={styles.headerLembur}>
                          <Text style={styles.textTanggal}>{tanggalDay1}</Text>
                          <View style={styles.switchRow}>
                            <Text style={styles.textSwitch}>Tidak ikut lembur</Text>
                            <Switch trackColor={{ false: "#767775", true: "#c44b62" }} thumbColor={tidakIkutDay1 ? "#b10f2e" : "#2b2f44"} value={tidakIkutDay1} onValueChange={setTidakIkutDay1} />
                          </View>
                        </View>
                        {!tidakIkutDay1 ? (
                          <TimeInput labelTanggal={""} waktu={waktuDay1} lockStart={lockStartDay1} onChangeWaktu={(field, val) => handleWaktuChange('day1', field, val)} />
                        ) : (
                          <View style={styles.boxTidakIkut}>
                            <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* --- TAMPILAN DAY 2 (Hanya muncul jika Day 2 ADA dan BELUM diabsen) --- */}
                    {tanggalDay2 !== '' && !isSudahDay2 && (
                      <View style={{ marginTop: 20 }}>
                        <View style={styles.headerLembur}>
                          <Text style={styles.textTanggal}>{tanggalDay2}</Text>
                          <View style={styles.switchRow}>
                            <Text style={styles.textSwitch}>Tidak ikut lembur</Text>
                            <Switch trackColor={{ false: "#767577", true: "#c44b62" }} thumbColor={tidakIkutDay2 ? "#b10f2e" : "#2b2f44"} value={tidakIkutDay2} onValueChange={setTidakIkutDay2} />
                          </View>
                        </View>
                        {!tidakIkutDay2 ? (
                          <TimeInput labelTanggal={""} waktu={waktuDay2} lockStart={lockStartDay2} onChangeWaktu={(field, val) => handleWaktuChange('day2', field, val)} />
                        ) : (
                          <View style={styles.boxTidakIkut}>
                            <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
                          </View>
                        )}
                      </View>
                    )}

                    <Gap height={20} />

                    {/* --- UI UPLOAD EXCEL START --- */}
                    <View style={styles.boxUpload}>
                      <Text style={styles.textLabelUpload}>Upload File Excel</Text>
                      <View style={styles.rowUpload}>
                        <View style={{ width: 80 }}>
                          <Button
                            label="Pilih File"
                            onPress={handlePickExcel}
                          />
                        </View>

                        <Text style={styles.textFileName} numberOfLines={1} ellipsizeMode="middle">
                          {fileExcel ? fileExcel.name : 'Belum ada file dipilih'}
                        </Text>

                        {/* Tombol Cancel (X) - Hanya muncul jika fileExcel memiliki data */}
                        {fileExcel && (
                          <TouchableOpacity
                            style={styles.btnCancelUpload}
                            onPress={() => setFileExcel(null)} // Ini akan menghapus file dari state
                          >
                            <Text style={styles.textCancelUpload}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </View>
                    {/* --- UI UPLOAD EXCEL END --- */}

                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {/* BUNGKUS SIGNATURE */}
        {tampilkanFormLanjutan && (
          <>
            <Gap height={20} />
            <Signature key={resetKey} onOK={(base64) => setTandaTanganBase64(base64)} />
          </>
        )}
      </ScrollView>

      {/* BUNGKUS TOMBOL SUBMIT */}
      {tampilkanFormLanjutan && (
        <View style={styles.footer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              {/* Anda bisa menggunakan ActivityIndicator bawaan React Native */}
              <ActivityIndicator size="small" color="#1976D2" />
              <Text style={styles.textLoading}>Sedang memproses...</Text>
            </View>
          ) : (
            <Button label="Submit" onPress={() => handleSubmit()} />
          )}
        </View>
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    backgroundColor: '#fff',
  },
  THello: {
    fontSize: 32,
    fontWeight: 'bold'
  },
  containerNIK: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  footer: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },

  // Style baru untuk fitur Tidak Ikut Lembur
  headerLembur: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8
  },
  textTanggal: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  textSwitch: {
    marginRight: 8,
    color: '#b10f2e',
    fontWeight: '500',
    fontSize: 12
  },
  boxTidakIkut: {
    padding: 15,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b10f2e'
  },
  textTidakIkut: {
    color: '#b10f2e',
    textAlign: 'center',
    fontWeight: 'bold'
  },
  boxSudahAbsen: {
    padding: 15,
    backgroundColor: '#E8F5E9', // Hijau muda
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignItems: 'center'
  },
  textSudahAbsen: {
    color: '#2E7D32',
    fontWeight: 'bold'
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 10,
  },
  textLoading: {
    marginLeft: 10,
    color: '#1976D2',
    fontWeight: '600',
    fontSize: 14,
  },
  boxError: {
    marginTop: 10,
    padding: 12,
    backgroundColor: '#FFEBEE',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#EF5350',
  },
  textError: {
    color: '#C62828',
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  boxUpload: {
    padding: 15,
    backgroundColor: '#f5f7ff', // Warna ungu muda (bebas disesuaikan)
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000022',
  },
  textLabelUpload: {
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#2b2f44'
  },
  rowUpload: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textFileName: {
    flex: 1,
    marginLeft: 10,
    color: '#666',
    fontSize: 13,
    fontStyle: 'italic'
  },
  btnCancelUpload: {
    marginLeft: 10,
    backgroundColor: '#FFEBEE', // Latar belakang merah sangat muda
    width: 28,
    height: 28,
    borderRadius: 14, // Membuatnya bulat
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  textCancelUpload: {
    color: '#D32F2F', // Warna merah tegas
    fontSize: 12,
    fontWeight: '900',
  },
});