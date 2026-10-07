import { StyleSheet, Text, View, Image } from 'react-native'
import React from 'react'

const Brands = () => {
  return (
    <View>
      <View style={styles.logoContainer}>
        <Image
          source={require('../../assets/images/images.jpg')}
          style={styles.logoImage}
        />
      </View>
    </View>
  )
}

export default Brands

const styles = StyleSheet.create({
  logoContainer: {
    marginTop: 60,
    alignItems: 'center'
  },
  logoImage: {
    width: 100,
    height: 100,
    borderRadius: 50
  }
})