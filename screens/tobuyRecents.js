import {
  Text,
  View,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useState, useEffect, useContext } from 'react';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet } from 'react-native';
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';
import { Alert } from 'react-native';

export default function ToBuyRecentsScreen({ navigation, route }) {
  const { theme } = useContext(ThemeContext);
  const [recents, setRecents] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadRecents();
  }, []);

  const loadRecents = async () => {
    const stored = await AsyncStorage.getItem('ToBuyRecents');
    const data = stored ? JSON.parse(stored) : [];
    setRecents(data);
  };

  const addAgain = async (item) => {
    const stored = await AsyncStorage.getItem('ToBuy');
    const current = stored ? JSON.parse(stored) : [];

    const exists = current.some((i) =>
      item.barcode
        ? i.barcode && i.barcode === item.barcode
        : i.customName === item.customName && i.realName === item.realName,
    );

    if (exists) {
      Alert.alert(
        'Already in To Buy',
        'This item already exists in the To Buy list.',
      );
      return;
    }

    const newItem = {
      id: Date.now().toString(),
      customName: item.customName || item.name || 'Untitled',
      realName: item.realName || item.name || '',
      barcode: item.barcode || '',
      energy: Number(item.energy || 0),
      bought: false,
      profileCounted: false,
      linked: Boolean(item.linked || item.barcode || item.realName),
      addedAt: item.addedAt || new Date().toISOString(),
    };

    const updated = [newItem, ...current];
    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));

    navigation.navigate('MainTabs', {
      screen: 'ToBuy',
    });
  };

  const clearRecents = async () => {
    await AsyncStorage.removeItem('ToBuyRecents');

    setRecents([]);
  };

  const deleteRecent = async (id) => {
    const updated = recents.filter((i) => i.id !== id);

    setRecents(updated);

    await AsyncStorage.setItem('ToBuyRecents', JSON.stringify(updated));
  };

  const filteredRecents = recents.filter((item) =>
    (item.customName || '').toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View
      style={{
        flex: 1,

        backgroundColor: 'black',

        padding: 15,
      }}
    >
      <View
        style={{
          flexDirection: 'row',

          gap: 10,

          marginBottom: 20,
        }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{
            width: 50,

            height: 50,

            backgroundColor: '#181818',

            borderRadius: 20,

            justifyContent: 'center',

            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: 'white',

              fontSize: 22,
            }}
          >
            ←
          </Text>
        </TouchableOpacity>

        <TextInput
          placeholder="Search recents..."
          placeholderTextColor="#777"
          value={search}
          onChangeText={setSearch}
          style={{
            flex: 1,

            backgroundColor: '#181818',

            color: 'white',

            padding: 15,

            borderRadius: 20,
          }}
        />
        <TouchableOpacity
          onPress={clearRecents}
          style={{
            width: 50,
            height: 50,

            backgroundColor: '#2b1717',

            borderRadius: 20,

            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              color: '#ff6666',
              fontSize: 20,
            }}
          >
            🗑
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={filteredRecents}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Swipeable
            renderRightActions={() => (
              <View
                style={{
                  flex: 1,
                  backgroundColor: '#ff4444',
                  justifyContent: 'center',
                  alignItems: 'flex-end',
                  paddingRight: 25,
                  marginBottom: 10,
                  borderRadius: 20,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontWeight: 'bold',
                  }}
                >
                  Delete
                </Text>
              </View>
            )}
            onSwipeableOpen={(dir) => {
              if (dir === 'right') {
                deleteRecent(item.id);
              }
            }}
          >
            <View
              style={{
                backgroundColor: '#181818',
                padding: 20,
                borderRadius: 20,
                marginBottom: 10,

                flexDirection: 'row',
                alignItems: 'center',
              }}
            >
              {/* PRESSABLE CONTENT */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => addAgain(item)}
                style={{
                  flex: 1,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    fontSize: 20,
                  }}
                >
                  {item.customName}
                </Text>

                <Text
                  style={{
                    color: item.realName ? '#7CFC00' : '#777',
                    marginTop: 4,
                  }}
                >
                  {item.realName || item.name || 'Not Linked'}
                </Text>
              </TouchableOpacity>

              {/* DETAILS */}
              <TouchableOpacity
                activeOpacity={0.8}
                disabled={!item.barcode}
                onPress={() => {
                  if (item.barcode) {
                    navigation.navigate('Details', {
                      barcode: item.barcode,
                    });
                  }
                }}
                style={{
                  width: 36,
                  height: 36,

                  borderRadius: 18,

                  borderWidth: 2,

                  borderColor: item.barcode ? '#FFD93D' : '#444',

                  backgroundColor: item.barcode ? '#252525' : '#151515',

                  alignItems: 'center',
                  justifyContent: 'center',

                  marginRight: 14,
                }}
              >
                <Text
                  style={{
                    color: item.barcode ? '#FFD93D' : '#666',
                    fontWeight: 'bold',
                    fontSize: 16,
                  }}
                >
                  !
                </Text>
              </TouchableOpacity>

              {/* TIME */}
              <View
                style={{
                  alignItems: 'flex-end',
                  width: 70,
                }}
              >
                <Text
                  style={{
                    color: '#999',
                    fontSize: 12,
                  }}
                >
                  {item.addedAt
                    ? new Date(item.addedAt).toLocaleDateString()
                    : ''}
                </Text>

                <Text
                  style={{
                    color: '#555',
                    fontSize: 11,
                    marginTop: 2,
                  }}
                >
                  {item.addedAt
                    ? new Date(item.addedAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : ''}
                </Text>
              </View>
            </View>
          </Swipeable>
        )}
      />
    </View>
  );
}
