import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, View } from "react-native"; // Tambahkan Switch
import Button from "../components/button";
import Gap from "../components/gap";
import Input from "../components/input";
import Label from "../components/label";
import Signature from "../components/signature.web";
import TimeInput from "../components/timeInput";

export default function Page() {
  const [nik, setNik] = useState('');
  const [nama, setNama] = useState('');
  const [found, setFound] = useState(false)
  const [isNik, setIsNIK] = useState(false)
  const [tandaTanganBase64, setTandaTanganBase64] = useState('');
  const [tanggalDay1, setTanggalDay1] = useState('');
  const [tanggalDay2, setTanggalDay2] = useState('');
  const [jabatan, setJabatan] = useState('');

  // --- STATE BARU UNTUK TIDAK IKUT LEMBUR ---
  const [tidakIkutDay1, setTidakIkutDay1] = useState(false);
  const [tidakIkutDay2, setTidakIkutDay2] = useState(false);

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
          setWaktuDay1({
            startJam: '16', startMenit: '00',
            endJam: '', endMenit: '',
          });
        }
      } else {
        setTanggalDay1(''); // Pastikan kosong jika gagal
      }

      // --- PROSES DAY 2 ---
      const res2 = await AmbilTanggalDay('day2');
      if (res2 && res2.tanggal) {
        setTanggalDay2(res2.tanggal);
        if (res2.jam16 === true || res2.jam16 === "true") {
          setWaktuDay2({
            startJam: '16', startMenit: '00', 
            endJam: '', endMenit: ''
          });
        }
      } else {
        setTanggalDay2(''); // Sembunyikan Day 2
      }
    };

    fetchData();
  }, []);

  const CariNIK = async () => {
    if (!nik) {
      alert("Silakan masukkan NIK terlebih dahulu");
      return;
    }

    try {
      const url = `https://api.muhdimas.my.id/api/users/${nik}`;
      const response = await fetch(url)
      const data = await response.json();

      if (response.ok) {
        console.log("Data User ditemukan:", data); 
        setFound(true)
        setIsNIK(true)
        setNama(data.nama)
        setJabatan(data.jabatan)
      } else {
        setNama('');
        setJabatan('');
        setFound(false)
      }
    } catch (error) {
      console.error(error);
      alert("Gagal terhubung ke database");
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

    if (mulai > selesai ){ return false};

    return selisih >= (4 * 3600); 
  };


  const handleSubmit = async () => {
    // 1. Validasi Dasar
    if (!nik || !nama) return alert("Harap isi NIK dan Nama terlebih dahulu!");
    if (!tandaTanganBase64) return alert("Harap isi Tanda Tangan terlebih dahulu!");

    // --- Validasi Day 1 (Lewati jika Tidak Ikut) ---
    if (tanggalDay1 !== '') {
      if (!tidakIkutDay1) {
        if (!waktuDay1.endJam || waktuDay1.endJam === '') {
          return alert("Jam pulang Day 1 belum diisi!");
        }
        if (!isMinimal4Jam(waktuDay1)) {
          return alert(`⚠️ Lembur pada ${tanggalDay1} kurang dari 4 jam!`);
        }
      }
    }

    // --- Validasi Day 2 (Lewati jika Tidak Ikut) ---
    if (tanggalDay2 !== '') {
      if (!tidakIkutDay2) {
        if (!waktuDay2.endJam || waktuDay2.endJam === '') {
          return alert("Jam pulang Day 2 belum diisi!");
        }
        if (!isMinimal4Jam(waktuDay2)) {
          return alert(`⚠️ Lembur pada ${tanggalDay2} kurang dari 4 jam!`);
        }
      }
    }

    let pesanSukses = "";
    const url = 'https://api.muhdimas.my.id/api/absen'

    try {
      // 2. Jika Day 1 aktif, kirim data Day 1
      if (tanggalDay1 !== '') {
        const payloadDay1 = {
          nik: nik,
          nama: nama,
          jabatan: jabatan,
          tandaTangan: tandaTanganBase64,
          targetDay: 'day1',
          // Override jam jadi 00:00 jika tidak ikut
          ...(tidakIkutDay1 ? {
            startJam: '00', startMenit: '00',
            endJam: '00', endMenit: '00'
          } : waktuDay1)
        };

        const response1 = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadDay1)
        });

        if (response1.ok) pesanSukses += `✅ Absen Day 1 Tersimpan ${tidakIkutDay1 ? '(Tidak Ikut)' : ''}\n`;
      }

      // 3. Jika Day 2 aktif, kirim data Day 2
      if (tanggalDay2 !== '') {
        const payloadDay2 = {
          nik: nik,
          nama: nama,
          jabatan: jabatan,
          tandaTangan: tandaTanganBase64,
          targetDay: 'day2',
          // Override jam jadi 00:00 jika tidak ikut
          ...(tidakIkutDay2 ? {
            startJam: '00', startMenit: '00',
            endJam: '00', endMenit: '00'
          } : waktuDay2)
        };

        const response2 = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payloadDay2)
        });

        if (response2.ok) pesanSukses += `✅ Absen Day 2 Tersimpan ${tidakIkutDay2 ? '(Tidak Ikut)' : ''}`;
      }

      // 4. Tampilkan pemberitahuan ke user
      if (pesanSukses !== "") {
        alert("Berhasil!\n" + pesanSukses);
      } else {
        alert("Tidak ada data hari lembur yang dikirim.");
      }

    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan jaringan.");
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
        <Text style={styles.THello}>Hello 👋🏻, Gardira</Text>
        <Text>⚠️ Mohon isi sesuai absen di Fiory / Sap Portal ⚠️</Text>

        <Gap height={23} />
        <Label text="NIK" status={isNik} user={found} />
        <View style={styles.containerNIK}>
          <Input value={nik} onChangeText={setNik} />
          <Button label="Enter" onPress={CariNIK} />
        </View>
        <Gap height={20} />
        <Label text="Nama" />
        <Input value={nama} onChangeText={setNama} jabatan={jabatan} editable={false}/>

        {/* --- TAMPILAN DAY 1 --- */}
        {tanggalDay1 && (
          <View style={{ marginTop: 20 }}>
            {/* Header & Switch */}
            <View style={styles.headerLembur}>
              <Text style={styles.textTanggal}>{tanggalDay1}</Text>
              <View style={styles.switchRow}>
                <Text style={styles.textSwitch}>Tidak ikut lembur</Text>
                <Switch 
                  trackColor={{ false: "#767577", true: "#FFCDD2" }}
                  thumbColor={tidakIkutDay1 ? "#D32F2F" : "#f4f3f4"}
                  value={tidakIkutDay1} 
                  onValueChange={setTidakIkutDay1} 
                />
              </View>
            </View>

            {/* Render TimeInput atau Peringatan tergantung state switch */}
            {!tidakIkutDay1 ? (
              <TimeInput
                labelTanggal={""} // Label dikosongkan karena sudah ada di header atas
                waktu={waktuDay1}
                lockStart={waktuDay1.startJam === '16'}
                onChangeWaktu={(field, val) => handleWaktuChange('day1', field, val)}
              />
            ) : (
              <View style={styles.boxTidakIkut}>
                <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
              </View>
            )}
          </View>
        )}

        {/* --- TAMPILAN DAY 2 --- */}
        {tanggalDay2 && (
          <View style={{ marginTop: 20 }}>
            <View style={styles.headerLembur}>
              <Text style={styles.textTanggal}>{tanggalDay2}</Text>
              <View style={styles.switchRow}>
                <Text style={styles.textSwitch}>Tidak ikut lembur</Text>
                <Switch 
                  trackColor={{ false: "#767577", true: "#FFCDD2" }}
                  thumbColor={tidakIkutDay2 ? "#D32F2F" : "#f4f3f4"}
                  value={tidakIkutDay2} 
                  onValueChange={setTidakIkutDay2} 
                />
              </View>
            </View>

            {!tidakIkutDay2 ? (
              <TimeInput
                labelTanggal={""}
                waktu={waktuDay2}
                lockStart={waktuDay2.startJam === '16'}
                onChangeWaktu={(field, val) => handleWaktuChange('day2', field, val)}
              />
            ) : (
              <View style={styles.boxTidakIkut}>
                <Text style={styles.textTidakIkut}>Anda memilih tidak ikut lembur pada hari ini.</Text>
              </View>
            )}
          </View>
        )}

        <Gap height={20} />
        <Signature onOK={(base64) => setTandaTanganBase64(base64)} />
      </ScrollView>

      <View style={styles.footer}>
        <Button label="Submit" onPress={() => handleSubmit()} />
      </View>

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
    color: '#D32F2F', 
    fontWeight: '500',
    fontSize: 12
  },
  boxTidakIkut: {
    padding: 15, 
    backgroundColor: '#FFEBEE', 
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFCDD2'
  },
  textTidakIkut: {
    color: '#D32F2F', 
    textAlign: 'center',
    fontWeight: 'bold'
  }
});