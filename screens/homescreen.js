import { View, Text, TouchableOpacity } from 'react-native';
import { StyleSheet } from 'react-native';
import { themes } from '../constant/themes';
import { ThemeContext } from '../context/themeContext';
import { useContext } from 'react';

export default function HomeScreen({ navigation }) {
  const { theme, themeName, changeTheme } = useContext(ThemeContext);

  return (
    <View
      style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.background,
      }}
    >
      <Text
        style={{
          color: theme.text,
          fontSize: 30,
        }}
      >
        Nutriscan
      </Text>

      <TouchableOpacity
        style={{
          backgroundColor: theme.button,
          borderRadius: 10,
          padding: 15,
          margin: 20,
        }}
        onPress={() => navigation.navigate('Scanner')}
      >
        <Text
          style={{
            color: theme.buttonText,
          }}
        >
          Scan Product
        </Text>
      </TouchableOpacity>
    </View>
  );
}
