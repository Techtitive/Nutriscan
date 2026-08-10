import {
  View,
  FlatList,
  TouchableOpacity,
  Text,
  TextInput,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useContext } from 'react';
import { StyleSheet } from 'react-native';
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useLink } from '../context/linkContext';
import ErrorModal from '../components/modals/errorModal';

export default function TobuyScreen({ navigation, route }) {
  const { theme, themeName } = useContext(ThemeContext);
  const { linkMode, setLinkMode, itemId, setItemId, clearLink } = useLink();
  const [showError, setShowError] = useState(false);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [searchMode, setSearchMode] = useState(false);
  const [linkMenuVisible, setLinkMenuVisible] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const { width, height } = Dimensions.get('window');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [renameModal, setRenameModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [renameError, setRenameError] = useState('');

  const inputWidth = useRef(new Animated.Value(1)).current;

  const progressAnim = useRef(new Animated.Value(0)).current;

  const swipeRefs = useRef({});

  useEffect(() => {
    if (!route.params?.scannedProduct) return;

    linkItem(route.params.itemId, route.params.scannedProduct);

    navigation.setParams({
      scannedProduct: undefined,
      itemId: undefined,
    });
  }, [route.params?.scannedProduct]);
  useEffect(() => {
    console.log('ToBuy');
    console.log('linkMode =', linkMode);
    console.log('itemId =', itemId);
  }, [linkMode, itemId]);

  useFocusEffect(
    useCallback(() => {
      loadItems();
    }, []),
  );

  const loadItems = async () => {
    const stored = await AsyncStorage.getItem('ToBuy');

    if (stored) {
      setItems(JSON.parse(stored));
    }
  };

  const saveItems = async (updated) => {
    setItems(updated);

    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));
  };

  const upsertRecent = async (item) => {
    console.log('2');
    const stored = await AsyncStorage.getItem('ToBuyRecents');
    const recents = stored ? JSON.parse(stored) : [];

    const next = {
      ...item,
      id: String(item.id),
      addedAt: item.addedAt || new Date().toISOString(),
      linked: Boolean(item.linked),
      bought: Boolean(item.bought),
      profileCounted: Boolean(item.profileCounted),
    };

    const updated = [
      next,
      ...recents.filter((r) => String(r.id) !== String(next.id)),
    ].slice(0, 30);

    await AsyncStorage.setItem('ToBuyRecents', JSON.stringify(updated));
  };

  const addItem = async () => {
    if (!input.trim()) return;

    const newItem = {
      id: Date.now().toString(),
      realName: '',
      barcode: '',
      energy: 0,
      customName: input.trim(),
      bought: false,
      profileCounted: false,
      linked: false,
      addedAt: new Date().toISOString(),
    };

    const updated = [newItem, ...items];

    await saveItems(updated);
    await upsertRecent(newItem);

    setInput('');
  };

  const toggleBought = async (id) => {
    const profile = JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {
      scanned: 0,
      bought: 0,
      calories: 0,
    };

    const stored = await AsyncStorage.getItem('ToBuy');
    const currentItems = stored ? JSON.parse(stored) : [];

    const updated = currentItems.map((item) => {
      if (item.id !== id) return item;

      const nextBought = !item.bought;

      // CHECK
      if (nextBought && item.linked && !item.profileCounted) {
        profile.bought += 1;

        profile.calories += Number(item.energy || 0);

        return {
          ...item,
          bought: true,
          profileCounted: true,
        };
      }

      // UNCHECK
      if (!nextBought && item.linked && item.profileCounted) {
        profile.bought = Math.max(0, profile.bought - 1);

        profile.calories = Math.max(
          0,
          profile.calories - Number(item.energy || 0),
        );

        return {
          ...item,
          bought: false,
          profileCounted: false,
        };
      }

      return {
        ...item,
        bought: nextBought,
      };
    });

    await AsyncStorage.setItem('ProfileStats', JSON.stringify(profile));

    await saveItems(updated);
  };

  const filteredItems = items.filter((item) =>
    (item.customName || '').toLowerCase().includes(search.toLowerCase()),
  );

  const sortedItems = useMemo(() => {
    return [
      ...filteredItems.filter((i) => !i.bought),
      ...filteredItems.filter((i) => i.bought),
    ];
  }, [filteredItems]);

  const totalItems = items.length;

  const boughtItems = items.filter((i) => i.bought).length;

  const totalEnergy = items.reduce((sum, item) => sum + (item.energy || 0), 0);

  const boughtEnergy = items.reduce(
    (sum, item) => (item.bought ? sum + Number(item.energy || 0) : sum),
    0,
  );

  const progress = Math.min(
    1,
    Math.max(0, totalItems ? boughtItems / totalItems : 0),
  );

  useEffect(() => {
    Animated.spring(progressAnim, {
      toValue: progress,

      friction: 8,

      tension: 45,

      useNativeDriver: false,
    }).start();
  }, [progress]);

  const renameItem = async () => {
    const cleaned = newName.trim();

    if (!cleaned) {
      setRenameError('Please enter a product name');
      return;
    }

    setRenameError('');

    const stored = await AsyncStorage.getItem('ToBuy');
    const current = stored ? JSON.parse(stored) : [];

    const updated = current.map((i) =>
      i.id === selectedItem.id
        ? {
            ...i,
            customName: cleaned,
          }
        : i,
    );

    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));
    setItems(updated);

    const renamed = updated.find((i) => i.id === selectedItem.id);
    if (renamed) {
      await upsertRecent(renamed);
    }

    setRenameModal(false);
    setMenuVisible(false);
    setNewName('');
  };

  const removeItem = async () => {
    const stored = await AsyncStorage.getItem('ToBuy');

    const items = stored ? JSON.parse(stored) : [];

    const updated = items.filter((i) => i.id !== selectedItem.id);

    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));

    setItems(updated);

    setMenuVisible(false);
  };

  const deleteItem = async (id) => {
    const updated = items.filter((i) => i.id !== id);

    setItems(updated);

    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));
  };

  const openMenu = (item) => {
    setSelectedItem(item);

    setNewName(item.customName || '');

    setRenameError('');

    setMenuVisible(true);
  };

  const linkItem = async (id, product) => {
    console.log('1');
    const profile = JSON.parse(await AsyncStorage.getItem('ProfileStats')) || {
      scanned: 0,
      bought: 0,
      calories: 0,
    };

    let linkedRecent = null;

    console.log('id =', id);
    console.log('items length =', items.length);
    console.log('items =', items);

    const stored = await AsyncStorage.getItem('ToBuy');
    const currentItems = stored ? JSON.parse(stored) : [];

    const updated = currentItems.map((item) => {
      console.log('updated =', updated);
      if (item.id !== id) return item;

      const firstLink = !item.linked;

      if (firstLink) {
        profile.scanned += 1;

        if (item.bought) {
          profile.calories += Number(product.energy || 0);
        }
      }

      const nextItem = {
        ...item,
        linked: true,
        barcode: product.barcode || '',
        realName: product.name || product.realName || '',
        energy: Number(product.energy || 0),
        addedAt: item.addedAt || new Date().toISOString(),
      };

      linkedRecent = nextItem;
      return nextItem;
    });

    await AsyncStorage.setItem('ProfileStats', JSON.stringify(profile));
    await saveItems(updated);
    setSelectedItemId(null);

    const linkedItem = updated.find((i) => String(i.id) === String(id));

    if (linkedItem) {
      await upsertRecent(linkedItem);
    }

    if (linkedRecent) {
      await upsertRecent(linkedRecent);
    }

    clearLink();
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: theme.background,
        paddingTop: 10,
        paddingBottom: 0,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 15,
          paddingBottom: 10,
          gap: 8,
          alignItems: 'center',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 0,
            gap: 8,
            alignItems: 'center',
          }}
        >
          {/* ADD BAR */}
          {!searchMode && (
            <Animated.View
              style={{
                flex: inputWidth.interpolate({
                  inputRange: [0, 1],

                  outputRange: [0.25, 1],
                }),
              }}
            >
              <TextInput
                placeholder="Add Item..."
                placeholderTextColor={theme.placeholder}
                value={input}
                onChangeText={setInput}
                style={{
                  backgroundColor: theme.input,

                  color: theme.placeholder,

                  padding: 15,

                  borderRadius: 20,
                }}
              />
            </Animated.View>
          )}

          {/* PLUS BUTTON */}
          <TouchableOpacity
            onPress={searchMode ? () => {} : addItem}
            style={{
              width: 50,
              height: 50,

              backgroundColor: theme.button,

              borderRadius: 20,

              justifyContent: 'center',

              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: 30,
                fontWeight: 'bold',
                color: theme.buttonText,
              }}
            >
              +
            </Text>
          </TouchableOpacity>

          {/* SEARCH INPUT */}

          {searchMode && (
            <TextInput
              placeholder="Search"
              placeholderTextColor={theme.placeholder}
              value={search}
              onChangeText={setSearch}
              style={{
                flex: 1,

                backgroundColor: theme.input,

                color: theme.placeholder,

                padding: 15,

                borderRadius: 20,
              }}
            />
          )}

          {/* SEARCH BUTTON */}

          <TouchableOpacity
            onPress={() => {
              Animated.timing(inputWidth, {
                toValue: searchMode ? 1 : 0,

                duration: 250,

                useNativeDriver: false,
              }).start();

              setSearchMode(!searchMode);

              if (searchMode) {
                setSearch('');
              }
            }}
            style={{
              width: 50,
              height: 50,

              backgroundColor: theme.buttonSecondary,

              borderRadius: 20,

              justifyContent: 'center',

              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.buttonText,

                fontSize: 22,
              }}
            >
              {searchMode ? '✕' : '🔍'}
            </Text>
          </TouchableOpacity>

          {/* RECENTS */}

          <TouchableOpacity
            onPress={() => {
              setItemId(selectedItemId);
              setLinkMode(true);

              navigation.navigate('ToBuyRecents');
            }}
            style={{
              width: 50,
              height: 50,

              backgroundColor: theme.buttonSecondary,

              borderRadius: 20,

              justifyContent: 'center',

              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: theme.buttonText,

                fontSize: 22,
              }}
            >
              🕘
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={sortedItems}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{
          paddingHorizontal: 15,
        }}
        renderItem={({ item }) => {
          return (
            <Swipeable
              ref={(ref) => {
                swipeRefs.current[item.id] = ref;
              }}
              // SWIPE RIGHT → DONE
              renderLeftActions={() => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: item.bought
                      ? theme.buttonSecondary
                      : theme.button,
                    justifyContent: 'center',
                    paddingLeft: 20,
                    borderRadius: 20,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: item.bought ? theme.text : theme.textInverse,
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}
                  >
                    {item.bought ? '↩ Undo' : '✓ Done'}
                  </Text>
                </View>
              )}
              onSwipeableOpen={(direction) => {
                if (direction === 'left') {
                  swipeRefs.current[item.id]?.close();

                  setTimeout(() => {
                    toggleBought(item.id);
                  }, 120);
                }

                if (direction === 'right') {
                  swipeRefs.current[item.id]?.close();

                  setTimeout(() => {
                    deleteItem(item.id);
                  }, 120);
                }
              }}
              // SWIPE LEFT → DELETE
              renderRightActions={() => (
                <View
                  style={{
                    flex: 1,
                    backgroundColor: theme.buttonDanger,
                    justifyContent: 'center',
                    alignItems: 'flex-end',
                    paddingRight: 20,
                    borderRadius: 20,
                    marginBottom: 12,
                  }}
                >
                  <Text
                    style={{
                      color: theme.text,
                      fontWeight: 'bold',
                      fontSize: 18,
                    }}
                  >
                    🗑 Delete
                  </Text>
                </View>
              )}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onLongPress={() => {
                  setSelectedItem(item);
                  setNewName(item.customName);
                  setMenuVisible(true);
                }}
                delayLongPress={350}
                onPress={() => {
                  if (item.linked) {
                    navigation.navigate('Details', {
                      barcode: item.barcode,
                    });
                  } else {
                    setSelectedItem(item); // <-- THIS WAS MISSING
                    setSelectedItemId(item.id);
                    setLinkMenuVisible(true);
                  }
                }}
                style={{
                  paddingVertical: 18,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',

                  backgroundColor: item.bought
                    ? theme.cardTertiary
                    : theme.card,

                  opacity: item.bought ? 0.65 : 1,
                }}
              >
                <View
                  style={{
                    flex: 1,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      color: item.bought ? theme.textMuted : theme.text,

                      textDecorationLine: item.bought ? 'line-through' : 'none',
                    }}
                  >
                    {item.customName}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={{
                      color: item.linked ? theme.success : theme.error,

                      marginTop: 5,
                    }}
                  >
                    {item.linked
                      ? `✓ ${item.realName || 'Linked Product'}`
                      : '✕ Not Linked'}
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => toggleBought(item.id)}
                  style={{
                    width: 35,
                    height: 35,
                    borderRadius: 18,
                    borderWidth: 2,

                    borderColor: item.bought ? theme.success : theme.textMuted,

                    backgroundColor: item.bought
                      ? theme.success
                      : 'transparent',

                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: item.bought ? theme.background : theme.textMuted,
                      fontWeight: 'bold',
                    }}
                  >
                    ✓
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            </Swipeable>
          );
        }}
      />

      <View
        style={{
          height: 120,
          marginBottom: 100,
          backgroundColor: theme.card,
          marginTop: 10,
          margin: 15,
          borderRadius: 25,
          padding: 10,
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            textAlign: 'center',
            color: theme.success,
            fontSize: 18,
            fontWeight: 'bold',
          }}
        >
          GROCERY STATS
        </Text>

        <View
          style={{
            flexDirection: 'row',
            paddingHorizontal: 6,
            justifyContent: 'space-between',
          }}
        >
          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 30,
                fontWeight: 'bold',
              }}
            >
              {boughtEnergy.toFixed(1)}

              <Text
                style={{
                  color: theme.textMuted,
                  marginLeft: 15,
                  textAlign: 'center',
                  fontSize: 12,
                }}
              >
                {` / ${totalEnergy.toFixed(1)} kcal`}
              </Text>
            </Text>
          </View>

          <View>
            <Text
              style={{
                color: theme.text,
                fontSize: 26,
                fontWeight: 'bold',
              }}
            >
              {boughtItems}

              <Text
                style={{
                  color: theme.textMuted,
                  marginLeft: 15,
                  fontSize: 12,
                }}
              >
                {` / ${totalItems} Bought`}
              </Text>
            </Text>
          </View>
        </View>

        <View
          style={{
            marginTop: 2,
          }}
        >
          <View
            style={{
              height: 13,
              backgroundColor: theme.progressTrack,
              borderRadius: 20,
              overflow: 'hidden',
            }}
          >
            <View
              style={{
                height: 13,
                backgroundColor: theme.progressTrack,
                borderRadius: 20,
                overflow: 'hidden',
              }}
            >
              <Animated.View
                style={{
                  height: '100%',
                  backgroundColor: theme.progressFill,
                  borderRadius: 20,
                  width: progressAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, width * 0.8 + 5],
                  }),
                }}
              />
            </View>
          </View>

          <Text
            style={{
              color: theme.textMuted,
              marginTop: 2,
              textAlign: 'left',
            }}
          >
            {Math.round(progress * 100)}% Completed
          </Text>
        </View>
      </View>

      <Modal visible={linkMenuVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme.overlay,
          }}
        >
          <View
            style={{
              backgroundColor: theme.card,
              marginHorizontal: width * 0.15,
              margin: 25,
              padding: 20,
              paddingBottom: 25,
              borderRadius: 20,
            }}
          >
            {/* HEADER */}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 15,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: 'bold',
                  marginHorizontal: 5,
                }}
              >
                Link Product
              </Text>

              <TouchableOpacity onPress={() => setLinkMenuVisible(false)}>
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 30,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            {/* BUTTONS */}
            <View
              style={{
                gap: 10,
              }}
            >
              {[
                {
                  title: '📷  Scanner',
                  screen: 'Scanner',
                },
                {
                  title: '🕘  Recents',
                  screen: 'Recents',
                },
                {
                  title: '⭐  Favourites',
                  screen: 'Favourites',
                },
              ].map((button) => (
                <TouchableOpacity
                  key={button.screen}
                  onPress={() => {
                    setLinkMenuVisible(false);

                    setItemId(selectedItemId);
                    setLinkMode(true);

                    navigation.navigate(button.screen);
                  }}
                  style={{
                    backgroundColor: theme.cardSecondary,
                    paddingVertical: 18,
                    borderRadius: 14,
                    borderWidth: 0.5,
                    borderColor: theme.border,
                  }}
                >
                  <Text
                    style={{
                      color: theme.textSecondary,
                      fontWeight: 'bold',
                      textAlign: 'center',
                      fontSize: 16,
                    }}
                  >
                    {button.title}
                  </Text>
                </TouchableOpacity>
              ))}

              {/* CANCEL */}
              <TouchableOpacity
                onPress={() => setLinkMenuVisible(false)}
                style={{
                  backgroundColor: theme.buttonDanger,
                  paddingVertical: 18,
                  borderRadius: 14,
                  marginTop: 5,
                }}
              >
                <Text
                  style={{
                    color: theme.buttonText,
                    fontWeight: 'bold',
                    textAlign: 'center',
                    fontSize: 16,
                  }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={menuVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: theme.overlay,
            padding: 30,
          }}
        >
          <View
            style={{
              width: width * 0.8,
              backgroundColor: theme.card,
              borderRadius: 25,
              padding: 20,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                Manage Item
              </Text>

              <TouchableOpacity onPress={() => setMenuVisible(false)}>
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 28,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <Text
              style={{
                color: theme.textMuted,
                marginTop: 10,
                marginBottom: 20,
              }}
            >
              Added:
              {selectedItem?.addedAt &&
                new Date(selectedItem.addedAt).toLocaleString()}
            </Text>

            <TouchableOpacity
              onPress={() => {
                setMenuVisible(false);
                setRenameModal(true);
              }}
              style={{
                backgroundColor: theme.button,
                padding: 16,
                borderRadius: 12,
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  color: theme.buttonText,
                  textAlign: 'center',
                }}
              >
                ✏ Rename
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={removeItem}
              style={{
                backgroundColor: theme.buttonDanger,
                padding: 16,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: theme.buttonText,
                  textAlign: 'center',
                }}
              >
                🗑 Remove
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={renameModal} transparent animationType="fade">
        <View
          style={{
            alignItems: 'center',
            flex: 1,
            justifyContent: 'center',
            backgroundColor: theme.overlay,
            padding: 30,
          }}
        >
          <View
            style={{
              width: width * 0.8,
              backgroundColor: theme.card,
              padding: 20,
              borderRadius: 25,
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingHorizontal: 10,
              }}
            >
              <Text
                style={{
                  color: theme.text,
                  fontSize: 22,
                  fontWeight: 'bold',
                }}
              >
                Rename Item
              </Text>

              <TouchableOpacity onPress={() => setRenameModal(false)}>
                <Text
                  style={{
                    color: theme.textMuted,
                    fontSize: 28,
                  }}
                >
                  ×
                </Text>
              </TouchableOpacity>
            </View>

            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholderTextColor={theme.placeholder}
              style={{
                backgroundColor: theme.input,
                color: theme.text,
                padding: 15,
                borderRadius: 10,
                marginVertical: 15,
              }}
            />

            {renameError ? (
              <Text
                style={{
                  color: theme.danger,
                  fontSize: 13,
                  marginBottom: 10,
                  marginLeft: 4,
                }}
              >
                {renameError}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={renameItem}
              style={{
                backgroundColor: theme.button,
                padding: 15,
                borderRadius: 12,
              }}
            >
              <Text
                style={{
                  color: theme.buttonText,
                  textAlign: 'center',
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
