import React from 'react';
import { Dimensions, StyleSheet, Text, TextInput, View } from 'react-native';

const screenWidth = Dimensions.get('window').width;
// Jika layar kecil (seperti iPhone SE), gunakan ukuran 40, jika besar gunakan 48
const boxSize = screenWidth < 380 ? 40 : 48;

interface ITimeInput {
    labelTanggal: string;
    waktu: {
        startJam: string; startMenit: string;
        endJam: string; endMenit: string;
    };
    onChangeWaktu: (field: string, value: string) => void;
    lockStart?: boolean
}

// 1. PINDAHKAN KE LUAR: BoxInput sekarang berdiri sendiri di luar TimeInput
const BoxInput = ({ value, fieldName, disabled = false, onChangeWaktu }: any) => {

    // Fungsi pembersih angka juga ikut dipindah ke sini
    const handleNumericChange = (text: string) => {
        const validNumber = text.replace(/[^0-9]/g, '');
        onChangeWaktu(fieldName, validNumber);
    };

    return (
        <TextInput
            style={[
                styles.box,
                value !== '' ? styles.boxActive : null,
                disabled ? styles.boxDisabled : null
            ]}
            value={value}
            placeholder="00"
            placeholderTextColor="#B0B0B0"
            onChangeText={handleNumericChange}
            keyboardType="number-pad"
            maxLength={2}
            editable={!disabled}
            selectTextOnFocus
        />
    );
};

// 2. KOMPONEN UTAMA
const TimeInput = ({ labelTanggal, waktu, onChangeWaktu, lockStart }: ITimeInput) => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{labelTanggal}</Text>

            {/* Hilangkan rowMain, gunakan View biasa atau bungkus dengan View yang fleksibel */}
            <View style={styles.timeWrapper}>
                {/* ---- BAGIAN START ---- */}
                <View style={styles.column}>
                    <Text style={styles.label}>Start</Text>
                    <View style={styles.timeRow}>
                        <BoxInput value={waktu.startJam} fieldName="startJam" onChangeWaktu={onChangeWaktu} disabled={lockStart} />
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.startMenit} fieldName="startMenit" onChangeWaktu={onChangeWaktu} disabled={lockStart} />
                        {/* <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.startDetik} fieldName="startDetik" onChangeWaktu={onChangeWaktu} disabled={lockStart} /> */}
                    </View>
                </View>

                {/* Ganti panah samping dengan indikator ke bawah jika ingin lebih aman */}
                <View style={styles.separator}>
                    <Text style={styles.separatorText}>ke</Text>
                </View>

                {/* ---- BAGIAN END ---- */}
                <View style={styles.column}>
                    <Text style={styles.label}>End</Text>
                    <View style={styles.timeRow}>
                        <BoxInput value={waktu.endJam} fieldName="endJam" onChangeWaktu={onChangeWaktu} />
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.endMenit} fieldName="endMenit" onChangeWaktu={onChangeWaktu} />
                        {/* <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.endDetik} fieldName="endDetik" onChangeWaktu={onChangeWaktu} /> */}
                    </View>
                </View>
            </View>
        </View>
    );
}

export default TimeInput;

const styles = StyleSheet.create({
    container: { marginVertical: 15 },
    title: { fontSize: 18, marginBottom: 10, color: '#333' },

    // Gunakan wrap agar jika tidak muat, bagian END pindah ke bawah secara otomatis
    timeWrapper: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between'
    },

    column: { flexDirection: 'column' },
    label: { fontSize: 14, marginBottom: 8, color: '#666' },
    timeRow: { flexDirection: 'row', alignItems: 'center' },

    box: {
        width: boxSize,      // MENGGUNAKAN VARIABEL boxSize
        height: boxSize,     // MENGGUNAKAN VARIABEL boxSize
        backgroundColor: '#F9F9F9',
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        fontSize: 16,
        textAlign: 'center',
        color: '#000',
    },
    boxActive: { borderColor: '#F4D03F', backgroundColor: '#FAFAFA' },
    boxDisabled: { backgroundColor: '#505050', borderColor: '#bebebe', color: '#e5e5e5' },

    colon: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 2,
        color: '#000'
    },

    separator: {
        marginTop: 20,
        paddingHorizontal: 4,
        justifyContent: 'center',
        alignItems: 'center'
    },

    // TAMBAHKAN INI AGAR ERROR PROPERTY 'separatorText' HILANG
    separatorText: {
        fontSize: 12,
        color: '#B0B0B0',
        fontWeight: 'bold'
    },

    arrowContainer: {
        width: 24, height: 24, backgroundColor: '#F4D03F', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginTop: 25, marginHorizontal: 5,
    },
    arrowText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});