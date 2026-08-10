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
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';
import { useLink } from '../context/linkContext';

const { width, height } = Dimensions.get('window');

const CARD_MARGIN = 8;
const NUM_COLUMNS = 2;

const cardWidth = (width - CARD_MARGIN * (NUM_COLUMNS * 2 + 2)) / NUM_COLUMNS;

export default function FavoritesScreen({ navigation }) {
  const { theme, themeName } = useContext(ThemeContext);
  const { linkMode, setLinkMode, itemId, setItemId } = useLink();
  const [showError, setShowError] = useState(false);
  const [Favourites, setFavourites] = useState([]);

  useFocusEffect(
    useCallback(() => {
      loadFavourites();
    }),
  );

  const loadFavourites = async () => {
    const stored = await AsyncStorage.getItem('Favourites');

    if (stored) {
      setFavourites(JSON.parse(stored));
    }
  };

  const selectFavourite = async (item) => {
    console.log('LINK MODE =', linkMode);
    console.log('ITEM ID =', itemId);

    if (linkMode && itemId) {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v0/product/${item.barcode}.json`,
      );

      const data = await response.json();

      navigation.navigate('MainTabs', {
        screen: 'ToBuy',
        params: {
          scannedProduct: {
            barcode: item.barcode,
            realName: data.product.product_name,
            customName: item.name,
            energy: data.product.nutriments?.['energy-kcal'] || 0,
          },
          itemId,
        },
      });

      // Exit linking mode forever
      clearLink();

      return;
    }

    console.log('Navigating with:');
    console.log('linkMode =', linkMode);
    console.log('itemId =', itemId);
    console.log('barcode =', item.barcode);
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
        data={Favourites}
        keyExtractor={(item) => item.barcode}
        numColumns={NUM_COLUMNS}
        contentContainerStyle={{
          justifyContent: Favourites.length === 0 ? 'center' : 'flex-start',
          padding: CARD_MARGIN,
        }}
        ListEmptyComponent={
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              marginTop: height / 2 - 100,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                color: theme.text,
                fontSize: 18,
                fontWeight: 'bold',
              }}
            >
              No Favourites Yet
            </Text>

            <Text
              style={{
                color: theme.textSecondary,
                fontSize: 12,
                marginTop: 4,
              }}
            >
              Tap "Add Favourite" on any product.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => selectFavourite(item)}>
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
                {new Date(item.addedAt)
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
