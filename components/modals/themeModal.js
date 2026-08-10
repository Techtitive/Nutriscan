import { Modal, View, Text, TouchableOpacity } from 'react-native';

export default function ThemeModal({
  visible,
  currentTheme,
  onSelect,
  onClose,
}) {
  const ThemeButton = ({ emoji, title, value }) => (
    <TouchableOpacity
      onPress={() => {
        onSelect(value);
        onClose();
      }}
      style={{
        backgroundColor: '#242424',
        padding: 18,
        borderRadius: 18,
        marginTop: 12,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 18,
          textAlign: 'center',
          fontWeight: currentTheme === value ? 'bold' : '500',
        }}
      >
        {emoji} {title}
        {currentTheme === value ? ' ✓' : ''}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 25,
        }}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#181818',
            borderRadius: 30,
            padding: 28,
          }}
        >
          <Text
            style={{
              fontSize: 60,
              textAlign: 'center',
            }}
          >
            🎨
          </Text>

          <Text
            style={{
              color: 'white',
              fontSize: 26,
              fontWeight: 'bold',
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            Choose Theme
          </Text>

          <Text
            style={{
              color: '#888',
              textAlign: 'center',
              marginTop: 10,
            }}
          >
            Current: {currentTheme}
          </Text>

          <ThemeButton emoji="🖤" title="AMOLED" value="amoled" />

          <ThemeButton emoji="🌑" title="Dark" value="dark" />

          <ThemeButton emoji="🤍" title="Light" value="light" />

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 25,
              backgroundColor: '#333',
              padding: 16,
              borderRadius: 18,
            }}
          >
            <Text
              style={{
                color: 'white',
                textAlign: 'center',
                fontWeight: '600',
              }}
            >
              Close
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
