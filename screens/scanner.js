import { View, Text, TouchableOpacity, Dimensions } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ErrorModal from '../components/modals/errorModal';
import { StyleSheet } from 'react-native';
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';

export default function ScannerScreen({ navigation, route }) {
  const { theme, themeName, changeTheme } = useContext(ThemeContext);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [barcode, setBarcode] = useState('');
  const [showError, setShowError] = useState(false);
  const { width } = Dimensions.get('window');

  useEffect(() => {
    if (barcode) {
      console.log({ barcode });
    }
  }, [barcode]);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          backgroundColor: 'gray',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Text
          style={{
            fontSize: 20,
            color: 'white',
          }}
        >
          Camera Permission not granted
        </Text>

        <TouchableOpacity
          style={{
            backgroundColor: 'green',
            padding: 15,
            borderRadius: 10,
            margin: 10,
          }}
          onPress={requestPermission}
        >
          <Text
            style={{
              color: 'white',
            }}
          >
            Grant Permission
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // NORMAL SCAN
  const handleNormalScan = async (barcode) => {
    try {
      const stored = JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {
        scanned: 0,
        bought: 0,
        calories: 0,
      };

      stored.scanned += 1;

      await AsyncStorage.setItem('ProfileStats', JSON.stringify(stored));
    } catch (e) {
      console.log(e);
    }

    navigation.navigate('Details', {
      barcode,
    });
  };

  // LINK PRODUCT TO TOBUY
  const linkScannedProduct = async (barcode) => {
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
      );

      const data = await response.json();

      const productName = data?.product?.product_name || 'Unknown Product';

      const energy = Number(data?.product?.nutriments?.['energy-kcal']) || 0;

      const stored = await AsyncStorage.getItem('ToBuy');

      const items = stored ? JSON.parse(stored) : [];

      const profile = JSON.parse(
        await AsyncStorage.getItem('ProfileStats'),
      ) || {
        scanned: 0,
        bought: 0,
        calories: 0,
      };

      let scannedNew = false;

      const updated = items.map((item) => {
        if (item.id !== route.params.itemId) return item;

        const firstLink = !item.linked;

        if (firstLink) {
          scannedNew = true;
        }

        if (firstLink && item.bought) {
          profile.bought += 1;
          profile.calories += energy;
        }

        return {
          ...item,
          linked: true,
          barcode,
          realName: productName,
          energy,
          addedAt: new Date().toISOString(),
        };
      });

      if (scannedNew) {
        profile.scanned += 1;
      }

      await AsyncStorage.setItem('ProfileStats', JSON.stringify(profile));

      await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));

      navigation.navigate('MainTabs', {
        screen: 'ToBuy',
      });
    } catch (e) {
      console.log(e);
      setShowError(true);
    }
  };
  return (
    <View
      style={{
        backgroundColor: theme.background,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
      }}
    >
      <Text
        style={{
          color: theme.title,
          fontWeight: '600',
          fontSize: 18,
          margin: 8,
        }}
      >
        Align Your Barcode
      </Text>

      <CameraView
        style={{
          borderWidth: 3,
          borderColor: theme.accent,
          margin: 5,
          width: width * 0.78,
          height: width * 0.265,
          borderRadius: 20,
          overflow: 'hidden',
        }}
        facing="back"
        onBarcodeScanned={
          scanned
            ? undefined
            : async (result) => {
                setScanned(true);
                setBarcode(result.data);

                if (route.params?.linkMode) {
                  await linkScannedProduct(result.data);
                } else {
                  await handleNormalScan(result.data);
                }
              }
        }
      />

      <Text
        style={{
          fontSize: 12,
          color: theme.textSecondary,
        }}
      >
        Hold Steady For Automatic Scanning
      </Text>

      <Text
        style={{
          fontSize: 9,
          color: theme.accent,
        }}
      >
        {barcode ? barcode : 'No barcode scanned'}
      </Text>

      <TouchableOpacity
        onPress={() => navigation.navigate('MainTabs')}
        style={{
          backgroundColor: theme.error,
          borderRadius: 10,
          padding: 15,
          marginTop: 20,
        }}
      >
        <Text
          style={{
            color: theme.buttonText,
          }}
        >
          Go Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
