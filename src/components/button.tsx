import React from 'react'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

interface IButton {
    onPress: () => void,
    label: string
}

const Button = ({ onPress, label }: IButton) => {
    return (
        <TouchableOpacity style={[styles.container, label === 'Enter' ?  styles.boxEnter : styles.box]} onPress={onPress}>
            <Text style={styles.label}>{label}</Text>
        </TouchableOpacity>
    )
}

export default Button

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFF7C4',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6
    },
    boxEnter: {
        maxWidth: 68,
        height: 30,
        marginLeft: 15,
        flex: 1,
    },
    box: {
        maxWidth: '100%',
        height: 40,
    },
    label: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#F0CE00'
    }
})