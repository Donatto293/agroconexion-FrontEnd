import { useEffect } from 'react'
import { BackHandler } from 'react-native'

export default function useBackButtonHandler(callback) {
  useEffect(() => {
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      callback
    )

    return () => backHandler.remove()
  }, [callback])
}