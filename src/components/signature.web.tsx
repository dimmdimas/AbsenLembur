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
            // Mengambil hasil coretan menjadi Base64
            const dataURL = sigPad.current?.getTrimmedCanvas().toDataURL('image/png');
            onOK(dataURL);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.label}>Tanda Tangan</Text>
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