import React from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'

interface iLabel {
    text: string,
    status?: boolean | undefined
    user?: boolean
}
const Label = ({ text, status, user }: iLabel) => {
    if (status) {
        return (
            <View style={styles.container}>
                <Text style={styles.label}>{text}</Text>
                {user && (
                    <><Image source={require('../image/centang.png')} style={styles.img} /><Text> User ditemukan 🥳</Text></>
                )}

                {!user && (
                    <>
                        <Image source={require('../image/x.png')} style={styles.img} />
                        <Text> User tidak ditemukan 😵</Text>
                    </>
                )}
            </View>
        )
    }
    return (
        <View style={styles.container}>
            <Text style={styles.label}>{text}</Text>
        </View>
    )
}

export default Label

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    img: {
        height: 10,
        width: 10,
        marginLeft: 20
    },
    label: {
        marginLeft: 13,
        fontSize: 15,
    }
})