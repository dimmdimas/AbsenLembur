import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';

interface iInput {
    value?: string,
    onChangeText?: (text: string) => void;
    placeholder?: string,
    jabatan?: string,
    editable?: boolean
}


const Input = ({value, onChangeText, placeholder, jabatan, editable}: iInput) => {
    return (
        <View style={styles.Container}> 
            <TextInput style={styles.BoxInput} placeholder={placeholder} onChangeText={onChangeText} value={value} editable={editable}/>
            {jabatan && (
                <Text style={styles.jabatan}>{jabatan}</Text>
            )}
        </View>
    )
}

export default Input

const styles = StyleSheet.create({
    Container: {
        // marginTop: 6,
        flex: 1
    },
    BoxInput: {
        width: '100%',
        height: 42,
        backgroundColor: '#F6F6F6',
        padding: 20,
        borderRadius: 7,
        // marginTop: 4
    },
    jabatan: {
        fontSize: 10,
        marginLeft: 20,
        marginTop: 5,
        color: 'green'
    }
})