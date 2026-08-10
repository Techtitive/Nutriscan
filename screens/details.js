import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Modal,
  FlatList,
  TextInput,
} from 'react-native';
import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DetailsScreen({ route, navigation }) {
  const barcode = route.params?.barcode || 'No Barcode';

  const [product, setProduct] = useState(null);
  const { width, height } = Dimensions.get('window');
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFavourite, setisFavourite] = useState(false);
  const [isToBuy, setIsToBuy] = useState(false);
  const [linkedItemId, setLinkedItemId] = useState(null);
  const [showToBuyModal, setShowToBuyModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showExistingModal, setShowExistingModal] = useState(false);
  const [customName, setCustomName] = useState('');
  const [toBuyItems, setToBuyItems] = useState([]);

  const linkProductTextStyle = {
    color: 'white',
    margin: 5,
    fontWeight: 'bold',
  };

  const linkButtonStyle = {
    width: '100%',

    backgroundColor: '#252525',

    paddingVertical: 10,

    borderRadius: 10,

    justifyContent: 'center',

    alignItems: 'center',
  };
  const Nutrients = ({ label, value, style, unit = '' }) => {
    if (!isValid(value)) return null;

    return (
      <Text style={style}>
        {label}: {value}
        {unit}
      </Text>
    );
  };

  const title = {
    textAlign: 'left',
    color: 'black',
    fontWeight: 'bold',
    margin: 10,
    fontSize: 18,
  };

  const isValid = (value) => {
    return (
      value !== null &&
      value !== undefined &&
      value !== '' &&
      value !== ' ' &&
      value !== 'Unknown' &&
      value !== 'unknown' &&
      value !== 'N/A' &&
      value !== 'Not available'
    );
  };
  const hasNutrition =
    isValid(product?.nutriments?.calories) ||
    isValid(product?.nutriments?.protein) ||
    isValid(product?.nutriments?.carbohydrates) ||
    isValid(product?.nutriments?.sugar) ||
    isValid(product?.nutriments?.fat) ||
    isValid(product?.nutriments?.['saturated-fat']) ||
    isValid(product?.nutriments?.salt);

  const hasScore =
    isValid(product?.nutriscore_grade) || isValid(product?.nova_group);

  const hasBasic =
    isValid(product?.brands) ||
    isValid(product?.countries) ||
    isValid(product?.quantity);

  const hasEnergy = isValid(product?.nutriments?.['energy-kcal']);

  const hasAllergen = isValid(product?.allergens);

  const hasIngredients = isValid(product?.ingredients_text);

  const hasName = isValid(product?.product_name);

  const hasInformation =
    hasNutrition ||
    hasScore ||
    hasBasic ||
    hasEnergy ||
    hasAllergen ||
    hasName ||
    hasIngredients;

  const nutritionColor = (grade) => {
    switch (grade?.toLowerCase()) {
      case 'a':
        return 'green';
      case 'b':
        return 'darkgreen';
      case 'c':
        return 'yellow';
      case 'd':
        return 'orange';
      case 'e':
        return 'red';
      default:
        return 'green';
    }
  };

  const nutritionText = (grade) => {
    switch (grade?.toLowerCase()) {
      case 'c':
        return 'black';
      default:
        return 'white';
    }
  };

  const block1 = {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
    padding: 2,
  };
  const block2 = (grade) => {
    return {
      color: `${nutritionText(grade)}`,
      textAlign: 'left',
    };
  };
  const block3 = {
    color: 'white',
    textAlign: 'left',
  };

  useEffect(() => {
    async function getProduct() {
      try {
        setLoading(true);

        // IF opened from ToBuy linking
        if (route.params?.linkedProduct) {
          setProduct({
            product_name: route.params.linkedProduct.realName,
            brands: '',
            nutriments: {
              'energy-kcal': route.params.linkedProduct.energy,
            },
          });

          setLoading(false);
          return;
        }

        // Normal scanner/details behaviour
        const response = await fetch(
          `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
        );

        const data = await response.json();

        setProduct(data.product);

        await saveToRecents(data.product, barcode);

        await checkFavourite();
        await checkToBuy();
      } catch (e) {
        console.log(e);
        setLoading(false);
        setShowError(true);
      } finally {
        setLoading(false);
      }
    }

    getProduct();
  }, []);

  const saveToRecents = async (product, barcode) => {
    try {
      const existing = await AsyncStorage.getItem('recents');
      const recents = existing ? JSON.parse(existing) : [];
      const newItem = {
        barcode,
        name: product.product_name || 'Unknown Product',
        brand: product.brands || '',
        scannedAt: new Date().toISOString(),
      };

      const updated = [
        newItem,
        ...recents.filter((item) => item.barcode !== barcode),
      ];
      await AsyncStorage.setItem(
        'recents',
        JSON.stringify(updated.slice(0, 50)),
      );
    } catch (e) {
      console.log(e);

      setShowError(true);
    }
  };

  const toggleFavourite = async () => {
    if (!product) return;
    console.log('Favourite button pressed');
    const stored = await AsyncStorage.getItem('Favourites');

    const Favourites = stored ? JSON.parse(stored) : [];

    const favouriteItem = {
      barcode,
      name: product?.product_name,
      brand: product?.brands,
      addedAt: new Date().toISOString(),
    };

    const exists = Favourites.some((item) => item.barcode === barcode);

    if (exists) {
      const updated = Favourites.filter((item) => item.barcode !== barcode);

      await AsyncStorage.setItem('Favourites', JSON.stringify(updated));

      setisFavourite(false);
    } else {
      await AsyncStorage.setItem(
        'Favourites',
        JSON.stringify([favouriteItem, ...Favourites]),
      );

      setisFavourite(true);
    }
  };

  const checkFavourite = async () => {
    const stored = await AsyncStorage.getItem('Favourites');

    const Favourites = stored ? JSON.parse(stored) : [];

    const exists = Favourites.some((item) => item.barcode === barcode);
    setisFavourite(exists);
  };

  const checkToBuy = async () => {
    const stored = await AsyncStorage.getItem('ToBuy');

    const items = stored ? JSON.parse(stored) : [];

    const found = items.find((i) => i.barcode === barcode);

    if (found) {
      setIsToBuy(true);

      setLinkedItemId(found.id);
    } else {
      setIsToBuy(false);

      setLinkedItemId(null);
    }
  };

  const toggleToBuy = async () => {
    if (isToBuy) {
      const stored = await AsyncStorage.getItem('ToBuy');

      const items = stored ? JSON.parse(stored) : [];

      const updated = items.filter((i) => i.id !== linkedItemId);

      await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));

      setIsToBuy(false);

      return;
    }

    setShowLinkModal(true);
  };

  const addToBuy = async (customNameInput, existingId = null) => {
    const stored = await AsyncStorage.getItem('ToBuy');

    const items = stored ? JSON.parse(stored) : [];

    const originalName = product?.product_name;

    let updated;

    if (existingId) {
      updated = items.map((item) =>
        item.id === existingId
          ? {
              ...item,

              linked: true,

              barcode,

              realName: originalName,

              customName: customNameInput,

              energy: product?.nutriments?.['energy-kcal'] || 0,
            }
          : item,
      );
    } else {
      updated = [
        {
          id: Date.now(),

          realName: originalName,

          customName: customNameInput,

          barcode,

          linked: true,

          energy: product?.nutriments?.['energy-kcal'] || 0,
        },

        ...items,
      ];
    }

    await AsyncStorage.setItem('ToBuy', JSON.stringify(updated));

    const recentStored = await AsyncStorage.getItem('ToBuyRecents');
    const recents = recentStored ? JSON.parse(recentStored) : [];

    const recentItem = existingId
      ? updated.find((i) => i.id === existingId)
      : updated[0];

    if (recentItem) {
      const updatedRecents = [
        {
          ...recentItem,
          id: String(recentItem.id),
          addedAt: recentItem.addedAt || new Date().toISOString(),
        },
        ...recents.filter((r) => String(r.id) !== String(recentItem.id)),
      ].slice(0, 30);

      await AsyncStorage.setItem(
        'ToBuyRecents',
        JSON.stringify(updatedRecents),
      );
    }

    setShowLinkModal(false);

    setShowExistingModal(false);

    setCustomName('');

    navigation.navigate('MainTabs', {
      screen: 'ToBuy',
    });
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: 'black',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View
          style={{
            width: width * 0.8,
            backgroundColor: 'white',
            borderRadius: 10,
            padding: 20,
          }}
        >
          <View
            style={{
              height: 50,
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 20,
            }}
          />

          <View
            style={{
              height: 100,
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 15,
            }}
          />

          <View
            style={{
              height: 150,
              backgroundColor: '#ddd',
              borderRadius: 10,
              marginBottom: 15,
            }}
          />

          <View
            style={{
              height: 80,
              backgroundColor: '#ddd',
              borderRadius: 10,
            }}
          />
        </View>
      </View>
    );
  }

  if (!hasInformation) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'black',
        }}
      >
        <View
          style={{
            backgroundColor: 'white',
            width: width * 0.8,
            padding: 30,
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 15,
          }}
        >
          <Text
            style={{
              color: 'red',
              fontSize: 25,
              fontWeight: 'bold',
              marginBottom: 20,
            }}
          >
            Product Not Found
          </Text>

          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Scanner');
            }}
            style={{
              backgroundColor: 'green',
              borderRadius: 20,
            }}
          >
            <Text
              style={{
                padding: 15,
                color: 'white',
              }}
            >
              Scan Another Barcode
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  } else
    return (
      <View
        style={{
          backgroundColor: 'black',
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ScrollView
          style={{
            borderRadius: 10,
            backgroundColor: 'white',
            width: width * 0.8,
            maxHeight: height * 0.7,
            marginTop: 40,
            marginBottom: 0,
            padding: 20,
            paddingTop: 0,
          }}
        >
          {hasName && (
            <>
              <Text
                adjustsFontSizeToFit
                numberOfLines={2}
                style={{
                  color: 'black',
                  fontSize: 50,
                  textAlign: 'center',
                  width: '90%',
                  paddingTop: 10,
                  paddingBottom: 10,
                }}
              >
                {`${product?.product_name}` || 'Product Not Found'}
              </Text>
            </>
          )}

          {hasBasic && (
            <>
              <View
                style={{
                  backgroundColor: 'black',
                  borderRadius: 15,
                  padding: 15,
                  marginBottom: 5,
                }}
              >
                <Nutrients
                  style={block1}
                  label="Brand"
                  value={product?.brands}
                />
                <Nutrients
                  style={block1}
                  label="Country"
                  value={product?.countries}
                />
                <Nutrients
                  style={block1}
                  label="Quantity"
                  value={product?.quantity}
                />
              </View>
            </>
          )}

          {hasScore && (
            <>
              <Text style={title}>Nutrition Score</Text>

              <View
                style={{
                  backgroundColor: `${nutritionColor(product?.nutriscore_grade)}`,
                  borderRadius: 15,
                  padding: 10,
                  marginBottom: 5,
                }}
              >
                <Nutrients
                  style={block2(product?.nutriscore_grade?.toLowerCase())}
                  label="Nutriscore"
                  value={product?.nutriscore_grade?.toUpperCase()}
                />
                <Nutrients
                  style={block2(product?.nutriscore_grade?.toLowerCase())}
                  label="Nova Group"
                  value={product?.nova_group}
                />
              </View>
            </>
          )}

          {hasEnergy && (
            <>
              <Text style={title}>Energy</Text>
              <View
                style={{
                  backgroundColor: 'blue',
                  borderRadius: 15,
                  padding: 10,
                  marginBottom: 5,
                }}
              >
                <Text style={{ color: 'white', fontSize: 35, padding: 5 }}>
                  {`${product?.nutriments?.['energy-kcal']}`}kcal
                </Text>
              </View>
            </>
          )}

          {hasNutrition && (
            <>
              <Text style={title}>Nutrition Facts</Text>

              <View
                style={{
                  backgroundColor: 'gray',
                  borderRadius: 15,
                  padding: 10,
                  marginBottom: 5,
                }}
              >
                <Nutrients
                  style={block3}
                  label="Calorie"
                  value={product?.nutriments?.calories}
                  unit={product?.nutriments.calories_unit}
                />
                <Nutrients
                  style={block3}
                  label="Protein"
                  value={product?.nutriments?.protein}
                  unit={product?.nutriments.protein_unit}
                />
                <Nutrients
                  style={block3}
                  label="Carbs"
                  value={product?.nutriments?.carbohydrates}
                  unit={product?.nutriments.carbohydrates_unit}
                />
                <Nutrients
                  style={block3}
                  label="Sugar"
                  value={product?.nutriments?.sugar}
                  unit={product?.nutriments.sugar_unit}
                />
                <Nutrients
                  style={block3}
                  label="Fat"
                  value={product?.nutriments?.fat}
                  unit={product?.nutriments.fat_unit}
                />
                <Nutrients
                  style={block3}
                  label="Saturated Fat"
                  value={product?.nutriments?.['saturated-fat']}
                  unit={product?.nutriments['saturated-fat_unit']}
                />
                <Nutrients
                  style={block3}
                  label="Salt"
                  value={product?.nutriments?.salt}
                  unit={product?.nutriments.salt_unit}
                />
              </View>
            </>
          )}

          {hasAllergen && (
            <>
              <Text style={title}>Allergen</Text>
              <View
                style={{
                  backgroundColor: 'gray',
                  borderRadius: 15,
                  padding: 10,
                  marginBottom: 5,
                }}
              >
                <Text
                  style={{
                    color: 'white',
                  }}
                >
                  {`${product?.allergens}` || null}
                </Text>
              </View>
            </>
          )}

          {hasIngredients && (
            <>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Text style={title}>Ingredients</Text>

                <TouchableOpacity onPress={() => setExpanded(!expanded)}>
                  <Text
                    style={{
                      color: 'black',
                    }}
                  >
                    {expanded ? 'Show Less ▲' : 'Show More ▼'}
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  backgroundColor: 'black',
                  borderRadius: 15,
                  marginBottom: 25,
                }}
              >
                <Text
                  numberOfLines={expanded ? undefined : 3}
                  style={{
                    textAlign: 'left',
                    justifyContent: 'center',
                    color: 'white',
                    padding: 10,
                  }}
                >
                  {`${product?.ingredients_text}` || 'No Ingredients Available'}
                </Text>
              </View>
            </>
          )}
        </ScrollView>
        <View
          style={{
            flexDirection: 'row',
            paddingTop: 10,
            gap: 10,
            width: width * 0.8,
            marginBottom: 50,
          }}
        >
          <TouchableOpacity
            onPress={toggleFavourite}
            style={{
              justifyContent: 'center',
              alignContent: 'center',
              flex: 1,
              backgroundColor: isFavourite ? '#7b7b7b' : '#7CFC00',
              padding: 15,
              borderRadius: 15,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: isFavourite ? 'white' : 'black',
              }}
            >
              {isFavourite ? 'Remove Favourite' : 'Add Favourite'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={toggleToBuy}
            style={{
              flex: 1,

              backgroundColor: isToBuy ? '#777' : '#004cfc',

              padding: 15,

              borderRadius: 15,
            }}
          >
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                color: 'white',

                fontWeight: 'bold',

                textAlign: 'center',
              }}
            >
              {isToBuy ? 'Remove ToBuyList' : 'Add ToBuyList'}
            </Text>
          </TouchableOpacity>
        </View>
        <Modal visible={showExistingModal} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(0,0,0,.55)',
            }}
          >
            <View
              style={{
                width: width * 0.8,
                height: height * 0.6,

                backgroundColor: '#252525',

                borderRadius: 22,

                padding: 18,
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
                    color: 'white',
                    fontSize: 24,
                    fontWeight: 'bold',
                  }}
                >
                  Select A Product
                </Text>

                <TouchableOpacity onPress={() => setShowExistingModal(false)}>
                  <Text
                    style={{
                      color: '#bbb',
                      fontSize: 30,
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              {/* EMPTY STATE */}
              {toBuyItems.length === 0 ? (
                <View
                  style={{
                    flex: 1,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      color: 'white',

                      fontSize: 20,

                      textAlign: 'center',

                      marginBottom: 35,
                    }}
                  >
                    Your ToBuy list is empty
                  </Text>

                  <View
                    style={{
                      width: '100%',
                      gap: 10,
                    }}
                  >
                    <TouchableOpacity
                      onPress={() => setShowExistingModal(false)}
                      style={{
                        backgroundColor: '#555',

                        padding: 15,

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',

                          textAlign: 'center',

                          fontWeight: 'bold',
                        }}
                      >
                        Go Back
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => {
                        setShowExistingModal(false);

                        navigation.navigate('MainTabs', {
                          screen: 'ToBuy',
                        });
                      }}
                      style={{
                        backgroundColor: '#004cfc',

                        padding: 15,

                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: 'white',

                          textAlign: 'center',

                          fontWeight: 'bold',
                        }}
                      >
                        Open ToBuyList
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <FlatList
                  data={toBuyItems}
                  keyExtractor={(item) => item.id.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      onPress={() =>
                        addToBuy(item.customName || item.realName, item.id)
                      }
                    >
                      <View
                        style={{
                          backgroundColor: '#181818',

                          padding: 20,

                          marginBottom: 10,

                          borderRadius: 15,
                        }}
                      >
                        <Text
                          style={{
                            color: 'white',

                            fontSize: 18,

                            fontWeight: '600',
                          }}
                        >
                          {item.realName}
                        </Text>

                        {item.linked && (
                          <Text
                            style={{
                              color: '#7CFC00',

                              marginTop: 5,
                            }}
                          >
                            Linked
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                />
              )}
            </View>
          </View>
        </Modal>
        <Modal visible={showLinkModal} transparent animationType="fade">
          <View
            style={{
              flex: 1,

              justifyContent: 'center',

              backgroundColor: 'rgba(0,0,0,.5)',
            }}
          >
            <View
              style={{
                backgroundColor: '#181818',
                marginHorizontal: width * 0.15,

                margin: 25,

                padding: 20,
                paddingBottom: 25,

                borderRadius: 20,
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Text
                  style={{
                    color: 'white',
                    justifyContent: 'center',
                    textAlign: 'center',
                    fontWeight: 'Bold',
                    fontSize: 22,
                    marginHorizontal: 5,
                  }}
                >
                  Link Product
                </Text>
                <TouchableOpacity onPress={() => setShowLinkModal(false)}>
                  <Text
                    style={{
                      color: '#bbb',
                      fontSize: 30,
                    }}
                  >
                    ×
                  </Text>
                </TouchableOpacity>
              </View>

              <View
                style={{
                  flexDirection: 'row',
                  gap: 8,
                }}
              >
                <TextInput
                  placeholder="Custom name"
                  placeholderTextColor="gray"
                  value={customName}
                  onChangeText={setCustomName}
                  style={{
                    backgroundColor: '#333',

                    color: 'white',

                    padding: 15,
                    flex: 1,

                    marginTop: 15,
                    marginBottom: 10,

                    borderRadius: 10,
                  }}
                />
                <View
                  style={{
                    marginVertical: 15,
                    justifyContent: 'center',
                    padding: 10,
                    backgroundColor: 'green',
                    borderRadius: 10,
                  }}
                >
                  <TouchableOpacity onPress={() => addToBuy(customName)}>
                    <Text
                      style={[linkProductTextStyle, { textAlign: 'center' }]}
                    >
                      +
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              <View
                style={{
                  marginTop: 5,

                  gap: 10,

                  width: '100%',
                }}
              >
                <View style={linkButtonStyle}>
                  <TouchableOpacity
                    onPress={() => addToBuy(product?.product_name)}
                  >
                    <Text style={linkProductTextStyle}>Keep Original Name</Text>
                  </TouchableOpacity>
                </View>
                <View style={linkButtonStyle}>
                  <TouchableOpacity
                    onPress={async () => {
                      const stored = await AsyncStorage.getItem('ToBuy');

                      setToBuyItems(stored ? JSON.parse(stored) : []);

                      setShowExistingModal(true);
                    }}
                  >
                    <Text style={linkProductTextStyle}>Link To Existing</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    );
}
