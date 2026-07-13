/* eslint-disable @typescript-eslint/no-unused-vars */
import * as DocumentPicker from 'expo-document-picker';
import { useEffect, useState } from "react";
import { ActivityIndicator, Platform, ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
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

  const [tidakIkutDay1, setTidakIkutDay1] = useState(false);
  const [tidakIkutDay2, setTidakIkutDay2] = useState(false);

  const [isSudahDay1, setIsSudahDay1] = useState(false);
  const [isSudahDay2, setIsSudahDay2] = useState(false);

  const [resetKey, setResetKey] = useState(0);
  const [isTidakWajib, setIsTidakWajib] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [isApprovalOnly, setIsApprovalOnly] = useState(false);
  const NIK_OSH = "10038106";
  const NIK_MANAGER = "10000224";
  const NIK_MANAGER2 = "10005544";
  const NIK_HRD = "10003315";

  // --- STATE FILE, ERROR, & LOADING EXCEL PER HARI ---
  const [fileExcelDay1, setFileExcelDay1] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [fileExcelDay2, setFileExcelDay2] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
  const [fileIdDay1, setFileIdDay1] = useState(''); // Menyimpan ID file dari server
  const [fileIdDay2, setFileIdDay2] = useState(''); // Menyimpan ID file dari server
  const [errorExcelDay1, setErrorExcelDay1] = useState('');
  const [errorExcelDay2, setErrorExcelDay2] = useState('');
  const [isUploadingDay1, setIsUploadingDay1] = useState(false);
  const [isUploadingDay2, setIsUploadingDay2] = useState(false);

  const [waktuDay1, setWaktuDay1] = useState({
    startJam: '', startMenit: '', endJam: '', endMenit: ''
  });

  const [waktuDay2, setWaktuDay2] = useState({
    startJam: '', startMenit: '', endJam: '', endMenit: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      const res1 = await AmbilTanggalDay('day1');
      if (res1 && res1.tanggal) {
        setTanggalDay1(res1.tanggal);
        if (res1.jam16 === true || res1.jam16 === "true") {
          setWaktuDay1({ startJam: '16', startMenit: '00', endJam: '', endMenit: '', });
          setLockStartDay1(true);
        } else if (res1.jam12 === true || res1.jam12 === "true") {
          setWaktuDay1({ startJam: '12', startMenit: '00', endJam: '', endMenit: '', });
          setLockStartDay1(true);
        }
      } else {
        setTanggalDay1('');
      }

      const res2 = await AmbilTanggalDay('day2');
      if (res2 && res2.tanggal) {
        setTanggalDay2(res2.tanggal);
        if (res2.jam16 === true || res2.jam16 === "true") {
          setWaktuDay2({ startJam: '16', startMenit: '00', endJam: '', endMenit: '' });
          setLockStartDay2(true);
        } else if (res2.jam12 === true || res2.jam12 === "true") {
          setWaktuDay2({ startJam: '12', startMenit: '00', endJam: '', endMenit: '' });
          setLockStartDay2(true);
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

    // Reset state Excel saat ganti NIK
    setErrorExcelDay1('');
    setErrorExcelDay2('');
    setFileExcelDay1(null);
    setFileExcelDay2(null);
    setFileIdDay1('');
    setFileIdDay2('');

    try {
      const urlInfo = `https://api.muhdimas.my.id/api/users/${nik}`;
      const responseInfo = await fetch(urlInfo);
      const dataInfo = await responseInfo.json();

      if (responseInfo.ok) {
        const urlWajib = `https://api.muhdimas.my.id/api/cek-wajib-absen/${nik}`;
        const responseWajib = await fetch(urlWajib);

        const isApprover = nik === NIK_OSH || nik === NIK_MANAGER || nik === NIK_MANAGER2 || nik === NIK_HRD;

        if (responseWajib.ok || isApprover) {
          setFound(true);
          setIsNIK(true);
          setNama(dataInfo.nama);
          setJabatan(dataInfo.jabatan);
          setErrorMessage('');
          setIsTidakWajib(false);

          const statusRes = await fetch(`https://api.muhdimas.my.id/api/users/cek-absen/${nik}`);
          if (statusRes.ok) {
            const statusData = await statusRes.json();
            setIsSudahDay1(statusData.day1);
            setIsSudahDay2(statusData.day2);
          }

        } else {
          setNama(dataInfo.nama);
          setJabatan(dataInfo.jabatan);
          setFound(true);
          setIsNIK(true);
          setIsTidakWajib(true);
          setErrorMessage('');
        }

      } else {
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

  // --- LOGIKA BARU: VALIDASI EXCEL SAAT DIPILIH ---
  const handlePickExcel = async (day: 'day1' | 'day2') => {
    if (!nik || !nama) {
      alert("Harap masukkan dan Enter NIK terlebih dahulu sebelum upload Excel!");
      return;
    }

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const selectedFile = result.assets[0];

        // 1. Tampilkan status loading UI
        if (day === 'day1') {
          setIsUploadingDay1(true);
          setErrorExcelDay1('');
          setFileExcelDay1(null);
          setFileIdDay1('');
        } else {
          setIsUploadingDay2(true);
          setErrorExcelDay2('');
          setFileExcelDay2(null);
          setFileIdDay2('');
        }

        // 2. Siapkan file untuk divalidasi ke backend
        const formData = new FormData();
        if (Platform.OS === 'web') {
          formData.append('fileExcel', selectedFile.file as any);
        } else {
          let fileUri = selectedFile.uri;
          if (Platform.OS === 'ios') {
            fileUri = selectedFile.uri.replace('file://', '');
          }
          formData.append('fileExcel', {
            uri: fileUri,
            name: selectedFile.name || `upload_${day}.xlsx`,
            type: selectedFile.mimeType || 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          } as any);
        }

        // 3. Tembak endpoint validasi yang sudah kita buat sebelumnya
        const url = `https://api.muhdimas.my.id/api/upload-excel?nik=${nik}&nama=${nama}&targetDay=${day}`;
        const response = await fetch(url, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        const resData = await response.json();

        // 4. Handle Hasil Validasi
        if (response.ok) {
          // Excel Valid!
          if (day === 'day1') {
            setFileExcelDay1(selectedFile);
            setFileIdDay1(resData.fileId);
          } else {
            setFileExcelDay2(selectedFile);
            setFileIdDay2(resData.fileId);
          }
        } else {
          // Excel Ditolak Server (Tanggal salah, NIK beda, dll)
          const errorMessage = resData.error || 'File Excel tidak memenuhi syarat (Format salah).';
          if (day === 'day1') setErrorExcelDay1(errorMessage);
          else setErrorExcelDay2(errorMessage);
        }
      }
    } catch (error) {
      console.log("Error picking file:", error);
      const errText = "Koneksi gagal atau file terlalu besar saat melakukan pengecekan.";
      if (day === 'day1') setErrorExcelDay1(errText);
      else setErrorExcelDay2(errText);
    } finally {
      // Matikan status loading UI
      if (day === 'day1') setIsUploadingDay1(false);
      else setIsUploadingDay2(false);
    }
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    // 1. Validasi Dasar
    if (!nik || !nama) return alert("Harap isi NIK dan Nama terlebih dahulu!");
    if (!tandaTanganBase64) return alert("Harap isi Tanda Tangan terlebih dahulu!");

    // --- Validasi Day 1 ---
    if (tanggalDay1 !== '' && !isSudahDay1) {
      if (!tidakIkutDay1 && !hideTimeInput) {
        if (!waktuDay1.endJam || waktuDay1.endJam === '') return alert("Jam pulang Day 1 belum diisi!");
        if (!isMinimal4Jam(waktuDay1)) return alert(`⚠️ Lembur pada ${tanggalDay1} kurang dari 4 jam!`);
        if (!fileIdDay1) return alert("Excel Day 1 belum diupload atau belum valid!");
      }
    }

    // --- Validasi Day 2 ---
    if (tanggalDay2 !== '' && !isSudahDay2) {
      if (!tidakIkutDay2 && !hideTimeInput) {
        if (!waktuDay2.endJam || waktuDay2.endJam === '') return alert("Jam pulang Day 2 belum diisi!");
        if (!isMinimal4Jam(waktuDay2)) return alert(`⚠️ Lembur pada ${tanggalDay2} kurang dari 4 jam!`);
        if (!fileIdDay2) return alert("Excel Day 2 belum diupload atau belum valid!");
      }
    }

    let pesanSukses = "";
    let hasError = false;

    // PASTIKAN URL INI BENAR:
    // Jika di backend Anda menggunakan master router /api/, biarkan ini.
    // Jika Anda sempat mengubahnya menjadi /api/data/, maka ganti URL ini.
    const url = 'https://api.muhdimas.my.id/api/absen';
    setIsLoading(true);

    try {
      // 2. Kirim data Day 1 (SEKARANG MENGGUNAKAN JSON MURNI)
      if (tanggalDay1 !== '' && !isSudahDay1) {
        const payloadDay1 = (tidakIkutDay1 || hideTimeInput)
          ? { startJam: '00', startMenit: '00', endJam: '00', endMenit: '00' }
          : waktuDay1;

        const bodyAbsen1 = {
          nik,
          nama,
          jabatan,
          tandaTangan: tandaTanganBase64,
          targetDay: 'day1',
          isApprovalMode: hideTimeInput,
          startJam: payloadDay1.startJam || '00',
          startMenit: payloadDay1.startMenit || '00',
          endJam: payloadDay1.endJam || '00',
          endMenit: payloadDay1.endMenit || '00',
          fileId: fileIdDay1 // Jembatan ID File dari server
        };

        const response1 = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json' // Wajib untuk JSON
          },
          body: JSON.stringify(bodyAbsen1)
        });

        if (response1.ok) {
          pesanSukses += `✅ Absen Day 1 Tersimpan ${tidakIkutDay1 ? '(Tidak Ikut)' : ''}\n`;
          setIsSudahDay1(true);
        } else {
          // Proteksi jika server error dan tidak mengembalikan JSON
          let errMsg = 'Gagal menyimpan Day 1';
          try {
            const resError = await response1.json();
            errMsg = resError.error || errMsg;
          } catch (e) {
            errMsg = `Server Error (${response1.status}). Rute mungkin tidak ditemukan.`;
          }
          alert(`Error Day 1: ${errMsg}`);
          hasError = true;
        }
      }

      // 3. Kirim data Day 2 (Hanya diproses jika Day 1 tidak ada error)
      if (tanggalDay2 !== '' && !isSudahDay2 && !hasError) {
        const payloadDay2 = (tidakIkutDay2 || hideTimeInput)
          ? { startJam: '00', startMenit: '00', endJam: '00', endMenit: '00' }
          : waktuDay2;

        const bodyAbsen2 = {
          nik,
          nama,
          jabatan,
          tandaTangan: tandaTanganBase64,
          targetDay: 'day2',
          isApprovalMode: hideTimeInput,
          startJam: payloadDay2.startJam || '00',
          startMenit: payloadDay2.startMenit || '00',
          endJam: payloadDay2.endJam || '00',
          endMenit: payloadDay2.endMenit || '00',
          fileId: fileIdDay2
        };

        const response2 = await fetch(url, {
          method: 'POST',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(bodyAbsen2)
        });

        if (response2.ok) {
          pesanSukses += `✅ Absen Day 2 Tersimpan ${tidakIkutDay2 ? '(Tidak Ikut)' : ''}`;
          setIsSudahDay2(true);
        } else {
          let errMsg = 'Gagal menyimpan Day 2';
          try {
            const resError = await response2.json();
            errMsg = resError.error || errMsg;
          } catch (e) {
            errMsg = `Server Error (${response2.status}). Rute mungkin tidak ditemukan.`;
          }
          alert(`Error Day 2: ${errMsg}`);
          hasError = true;
        }
      }

      // 4. Sukses Total
      if (!hasError && pesanSukses !== "") {
        alert("Berhasil!\n" + pesanSukses);

        setNik('');
        setNama('');
        setJabatan('');
        setFound(false);
        setIsNIK(false);
        setTandaTanganBase64('');
        setTidakIkutDay1(false);
        setTidakIkutDay2(false);
        setFileExcelDay1(null);
        setFileExcelDay2(null);
        setFileIdDay1('');
        setFileIdDay2('');
        setWaktuDay1(prev => ({ ...prev, endJam: '', endMenit: '' }));
        setWaktuDay2(prev => ({ ...prev, endJam: '', endMenit: '' }));
        setResetKey(prevKey => prevKey + 1);
      }

    } catch (error) {
      console.error("DEBUG ERROR SUBMIT:", error);
      alert("Terjadi kesalahan jaringan saat mengirim data utama. Pastikan server merespon.");
    } finally {
      setIsLoading(false);
    }
  }

  const tampilkanFormLanjutan = found && !isTidakWajib && ((tanggalDay1 !== '' && !isSudahDay1) || (tanggalDay2 !== '' && !isSudahDay2));
  const tanggalAktif = [tanggalDay1, tanggalDay2].filter(tgl => tgl !== '').join(' & ');

  const tanggalSelesaiArr = [];
  if (tanggalDay1 !== '' && isSudahDay1) tanggalSelesaiArr.push(tanggalDay1);
  if (tanggalDay2 !== '' && isSudahDay2) tanggalSelesaiArr.push(tanggalDay2);
  const teksTanggalSelesai = tanggalSelesaiArr.join(' & ');

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

        {found && (
          <View style={{ marginTop: 20 }}>
            {isTidakWajib ? (
              <View style={[styles.boxSudahAbsen, { backgroundColor: '#FFF3E0', borderColor: '#FFE0B2' }]}>
                <Text style={[styles.textSudahAbsen, { color: '#E65100', textAlign: 'center' }]}>
                  ⛔ Anda tidak terdaftar dalam jadwal wajib lembur untuk tanggal {tanggalAktif}.
                </Text>
              </View>
            ) : (
              <View>
                {teksTanggalSelesai !== '' && (
                  <View style={[styles.boxSudahAbsen, { marginBottom: 15 }]}>
                    <Text style={[styles.textSudahAbsen, { textAlign: 'center' }]}>
                      ✅ Anda sudah mengisi absen lembur untuk tanggal {teksTanggalSelesai}.
                    </Text>
                  </View>
                )}

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

                {hideTimeInput && tampilkanFormLanjutan ? (
                  <View style={{ padding: 15, backgroundColor: '#E3F2FD', borderRadius: 8 }}>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#1565C0', fontSize: 16 }}>
                      Mode Approval Aktif
                    </Text>
                    <Text style={{ textAlign: 'center', fontWeight: 'bold', color: '#1565C0', fontSize: 14, marginTop: 5 }}>
                      Tanggal: {teksTanggalApproval}
                    </Text>
                    <Text style={{ textAlign: 'center', color: '#1565C0', fontSize: 13, marginTop: 5 }}>
                      Jam lembur & File Upload disembunyikan. Silakan langsung berikan tanda tangan Anda di bawah.
                    </Text>
                  </View>
                ) : (
                  <View>
                    {/* --- TAMPILAN DAY 1 --- */}
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
                          <View>
                            <TimeInput labelTanggal={""} waktu={waktuDay1} lockStart={lockStartDay1} onChangeWaktu={(field, val) => handleWaktuChange('day1', field, val)} />
                            <Gap height={15} />

                            {/* Upload Box Day 1 */}
                            <View style={[styles.boxUpload, errorExcelDay1 ? styles.boxUploadError : null]}>
                              <Text style={styles.textLabelUpload}>Upload Excel (Day 1)</Text>
                              <View style={styles.rowUpload}>
                                <View style={{ width: 100 }}>
                                  {isUploadingDay1 ? (
                                    <View style={styles.loadingBox}>
                                      <ActivityIndicator size="small" color="#1565C0" />
                                    </View>
                                  ) : (
                                    <Button label="Pilih File" onPress={() => handlePickExcel('day1')} />
                                  )}
                                </View>

                                <Text style={styles.textFileName} numberOfLines={1} ellipsizeMode="middle">
                                  {isUploadingDay1 ? 'Mengecek...' : (fileExcelDay1 ? `✅ ${fileExcelDay1.name}` : 'Belum ada file valid')}
                                </Text>

                                {fileExcelDay1 && !isUploadingDay1 && (
                                  <TouchableOpacity style={styles.btnCancelUpload} onPress={() => { setFileExcelDay1(null); setFileIdDay1(''); }}>
                                    <Text style={styles.textCancelUpload}>✕</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            {/* ERROR TEXT DI BAWAH KOTAK UPLOAD (DAY 1) */}
                            {errorExcelDay1 !== '' && (
                              <View style={styles.boxErrorUploadBawah}>
                                <Text style={styles.textErrorUploadBawah}>⚠️ {errorExcelDay1}</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <View style={styles.boxTidakIkut}>
                            <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
                          </View>
                        )}
                      </View>
                    )}

                    {/* --- TAMPILAN DAY 2 --- */}
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
                          <View>
                            <TimeInput labelTanggal={""} waktu={waktuDay2} lockStart={lockStartDay2} onChangeWaktu={(field, val) => handleWaktuChange('day2', field, val)} />
                            <Gap height={15} />

                            {/* Upload Box Day 2 */}
                            <View style={[styles.boxUpload, errorExcelDay2 ? styles.boxUploadError : null]}>
                              <Text style={styles.textLabelUpload}>Upload Excel (Day 2)</Text>
                              <View style={styles.rowUpload}>
                                <View style={{ width: 100 }}>
                                  {isUploadingDay2 ? (
                                    <View style={styles.loadingBox}>
                                      <ActivityIndicator size="small" color="#1565C0" />
                                    </View>
                                  ) : (
                                    <Button label="Pilih File" onPress={() => handlePickExcel('day2')} />
                                  )}
                                </View>

                                <Text style={styles.textFileName} numberOfLines={1} ellipsizeMode="middle">
                                  {isUploadingDay2 ? 'Mengecek...' : (fileExcelDay2 ? `✅ ${fileExcelDay2.name}` : 'Belum ada file valid')}
                                </Text>

                                {fileExcelDay2 && !isUploadingDay2 && (
                                  <TouchableOpacity style={styles.btnCancelUpload} onPress={() => { setFileExcelDay2(null); setFileIdDay2(''); }}>
                                    <Text style={styles.textCancelUpload}>✕</Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            </View>

                            {/* ERROR TEXT DI BAWAH KOTAK UPLOAD (DAY 2) */}
                            {errorExcelDay2 !== '' && (
                              <View style={styles.boxErrorUploadBawah}>
                                <Text style={styles.textErrorUploadBawah}>⚠️ {errorExcelDay2}</Text>
                              </View>
                            )}
                          </View>
                        ) : (
                          <View style={styles.boxTidakIkut}>
                            <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
                          </View>
                        )}
                      </View>
                    )}

                  </View>
                )}
              </View>
            )}
          </View>
        )}

        {tampilkanFormLanjutan && (
          <>
            <Gap height={20} />
            <Signature key={resetKey} onOK={(base64) => setTandaTanganBase64(base64)} />
          </>
        )}
      </ScrollView>

      {tampilkanFormLanjutan && (
        <View style={styles.footer}>
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#1976D2" />
              <Text style={styles.textLoading}>Sedang memproses...</Text>
            </View>
          ) : (
            <Button
              label="Submit"
              onPress={() => handleSubmit()}
            />
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
    backgroundColor: '#E8F5E9',
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

  // Style untuk Upload
  boxUpload: {
    padding: 15,
    backgroundColor: '#f5f7ff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#000022',
  },
  boxUploadError: {
    borderColor: '#D32F2F',
    backgroundColor: '#FFEBEE',
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
    fontStyle: 'italic',
    fontWeight: '500'
  },
  btnCancelUpload: {
    marginLeft: 10,
    backgroundColor: '#fff',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  textCancelUpload: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '900',
  },
  loadingBox: {
    backgroundColor: '#E3F2FD',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center'
  },

  // Style Spesifik untuk teks error di BAWAH kotak upload
  boxErrorUploadBawah: {
    marginTop: 5,
    paddingHorizontal: 5,
  },
  textErrorUploadBawah: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: 'bold',
    fontStyle: 'italic'
  }
});