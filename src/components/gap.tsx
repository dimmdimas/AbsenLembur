import React from 'react'
import { View } from 'react-native'

interface iGap  {
    height?: number,
    width?: number
}
const Gap = ({height, width}: iGap) => {
  return (
    <View style={{height: height, width: width}}>
    </View>
  )
}

export default Gap
