import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface ITimeInput {
    labelTanggal: string;
    waktu: {
        startJam: string; startMenit: string; startDetik: string;
        endJam: string; endMenit: string; endDetik: string;
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

            <View style={styles.rowMain}>
                {/* ---- BAGIAN START ---- */}
                <View style={styles.column}>
                    <Text style={styles.label}>Start</Text>
                    <View style={styles.timeRow}>
                        {/* Tambahkan props onChangeWaktu ke masing-masing BoxInput */}
                        <BoxInput value={waktu.startJam} fieldName="startJam" onChangeWaktu={onChangeWaktu} disabled={lockStart}  />
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.startMenit} fieldName="startMenit" onChangeWaktu={onChangeWaktu}  disabled={lockStart}/>
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.startDetik} fieldName="startDetik" onChangeWaktu={onChangeWaktu}  disabled={lockStart}/>
                    </View>
                </View>

                {/* ---- ICON PANAH TENGAH ---- */}
                <View style={styles.arrowContainer}>
                    <Text style={styles.arrowText}>➔</Text>
                </View>

                {/* ---- BAGIAN END ---- */}
                <View style={styles.column}>
                    <Text style={styles.label}>End</Text>
                    <View style={styles.timeRow}>
                        <BoxInput value={waktu.endJam} fieldName="endJam" onChangeWaktu={onChangeWaktu} />
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.endMenit} fieldName="endMenit" onChangeWaktu={onChangeWaktu} />
                        <Text style={styles.colon}>:</Text>
                        <BoxInput value={waktu.endDetik} fieldName="endDetik" onChangeWaktu={onChangeWaktu} />
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
    rowMain: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    column: { flexDirection: 'column' },
    label: { fontSize: 16, marginBottom: 8, color: '#333' },
    timeRow: { flexDirection: 'row', alignItems: 'center' },
    box: {
        width: 50, height: 50, backgroundColor: '#F9F9F9', borderRadius: 10,
        borderWidth: 2, borderColor: '#E0E0E0', fontSize: 18, textAlign: 'center', color: '#000',
    },
    boxActive: { borderColor: '#F4D03F', backgroundColor: '#FAFAFA' },
    boxDisabled: { backgroundColor: '#F0F0F0', borderColor: '#F0F0F0' },
    colon: { fontSize: 24, fontWeight: 'bold', marginHorizontal: 5, color: '#000' },
    arrowContainer: {
        width: 24, height: 24, backgroundColor: '#F4D03F', borderRadius: 12,
        justifyContent: 'center', alignItems: 'center', marginTop: 25, marginHorizontal: 10,
    },
    arrowText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' }
});