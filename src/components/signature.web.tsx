import React, { useRef } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
// PERHATIKAN: Kita memanggil library yang berbeda khusus untuk web
import SignaturePad from 'react-signature-canvas';

interface SignatureProps {
    onOK: (signature: string) => void;
}

const Signature: React.FC<SignatureProps> = ({ onOK }) => {
    const sigPad = useRef<any>(null);

    const handleClear = () => {
        sigPad.current?.clear();
    };

    // Fungsi ini dipanggil otomatis setiap kali user selesai mencoret (mengangkat kursor/jari)
    const handleEnd = () => {
        if (!sigPad.current?.isEmpty()) {
            // 1. Ambil canvas asli yang sudah dipotong area kosongnya
            const trimmedCanvas = sigPad.current?.getTrimmedCanvas();

            if (trimmedCanvas) {
                const MAX_WIDTH = 220; // Resolusi maksimal untuk Excel
                let finalDataURL = '';

                // 2. Jika gambar aslinya kebesaran, kita perkecil pakai canvas sementara
                if (trimmedCanvas.width > MAX_WIDTH) {
                    const scale = MAX_WIDTH / trimmedCanvas.width;
                    
                    const tempCanvas = document.createElement('canvas');
                    tempCanvas.width = trimmedCanvas.width * scale;
                    tempCanvas.height = trimmedCanvas.height * scale;
                    
                    const ctx = tempCanvas.getContext('2d');
                    if (ctx) {
                        ctx.drawImage(trimmedCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
                    }
                    
                    finalDataURL = tempCanvas.toDataURL('image/png');
                } else {
                    // Jika memang coretannya kecil, langsung jadikan base64
                    finalDataURL = trimmedCanvas.toDataURL('image/png');
                }

                // 3. Kirim base64 yang sudah sangat ringan ini ke halaman utama
                onOK(finalDataURL);
            }
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Tanda Tangan / Paraf</Text>
                <TouchableOpacity onPress={handleClear}>
                    <Text style={styles.clearText}>Hapus Ulang</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.box}>
                {/* Komponen murni Web (Canvas HTML5), dijamin tidak akan loading terus */}
                <SignaturePad
                    ref={sigPad}
                    onEnd={handleEnd}
                    penColor="black"
                    canvasProps={{
                        style: { width: '100%', height: '100%' }
                    }}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { marginBottom: 20 },
    header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
    label: { fontSize: 14, color: '#333' },
    clearText: { color: 'red', fontSize: 12 },
    box: {
        height: 180,
        backgroundColor: '#F5F5F5',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        overflow: 'hidden',
    },
});

export default Signature;