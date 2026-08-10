import {
  Text,
  View,
  FlatList,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState, React, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import ErrorModal from '../components/modals/errorModal';
import { StyleSheet } from 'react-native';
import { useLink } from '../context/linkContext';
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';

const { width } = Dimensions.get('window');

const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;

const cardWidth = (width - CARD_MARGIN * (NUM_COLUMNS * 2 + 2)) / NUM_COLUMNS;

export default function RecentsScreen({ navigation, route }) {
  const { theme, themeName, changeTheme } = useContext(ThemeContext);
  const [showError, setShowError] = useState(false);
  const [recents, setRecents] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadRecents();
    }, []),
  );

  const { linkMode, itemId, clearLink } = useLink();

  const loadRecents = async () => {
    const stored = await AsyncStorage.getItem('recents');

    if (stored) {
      setRecents(JSON.parse(stored));
    }
  };
  const selectRecent = async (item) => {
    console.log('RECENT PRESSED');
    console.log('linkMode =', linkMode);
    console.log('itemId =', itemId);

    if (linkMode && itemId) {
      console.log('ENTERING LINK MODE');

      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${item.barcode}.json`,
      );

      const data = await response.json();

      navigation.navigate('MainTabs', {
        screen: 'ToBuy',
        params: {
          scannedProduct: {
            barcode: item.barcode,
            realName: data?.product?.product_name,
            customName: item.customName || item.name,
            energy: data?.product?.nutriments?.['energy-kcal'] || 0,
          },
          itemId,
        },
      });

      clearLink();

      return;
    }

    navigation.navigate('Details', {
      barcode: item.barcode,
    });
  };

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
        paddingBottom: 100,
      }}
    >
      <FlatList
        data={recents}
        keyExtractor={(item) => item.barcode}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          padding: CARD_MARGIN,
        }}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectRecent(item)}>
            <View
              style={{
                width: cardWidth,
                margin: CARD_MARGIN,
                backgroundColor: theme.card,
                padding: 15,
                borderRadius: 12,
                minHeight: 180,
                justifyContent: 'space-between',
              }}
            >
              <Text
                numberOfLines={2}
                adjustsFontSizeToFit
                style={{
                  color: theme.text,
                  fontSize: 25,
                  textAlign: 'center',
                  fontWeight: 'bold',
                  paddingBottom: 12,
                  paddingTop: 8,
                }}
              >
                {item.name}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                }}
              >
                {item.brand}
              </Text>

              <Text
                style={{
                  color: theme.text,
                  fontSize: 13,
                }}
              >
                {`Barcode: ${item.barcode}`}
              </Text>

              <Text
                style={{
                  color: theme.textSecondary,
                  paddingTop: 6,
                }}
              >
                {new Date(item.scannedAt)
                  .toLocaleString('en-GB', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: 'numeric',
                    minutes: '2-digit',
                    hour12: true,
                  })
                  .toLowerCase()}
              </Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
