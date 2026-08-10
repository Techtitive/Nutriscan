import { Modal, View, Text, TouchableOpacity } from 'react-native';

export default function InfoModal({
  visible,
  icon = 'ℹ️',
  title = 'About',
  message = '',
  version = 'v1.0.0',
  buttonText = 'Close',
  onClose,
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
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
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 64,
            }}
          >
            {icon}
          </Text>

          <Text
            style={{
              color: 'white',
              fontSize: 26,
              fontWeight: 'bold',
              marginTop: 12,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: '#888',
              textAlign: 'center',
              marginTop: 14,
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              marginTop: 22,
              width: '100%',
              backgroundColor: '#222',
              borderRadius: 18,
              padding: 18,
            }}
          >
            <Text
              style={{
                color: '#7CFC00',
                fontWeight: 'bold',
                fontSize: 16,
              }}
            >
              NutriScan
            </Text>

            <Text
              style={{
                color: '#888',
                marginTop: 6,
              }}
            >
              Version {version}
            </Text>

            <Text
              style={{
                color: '#888',
                marginTop: 12,
              }}
            >
              Built with React Native
            </Text>

            <Text
              style={{
                color: '#888',
              }}
            >
              Powered by OpenFoodFacts
            </Text>

            <Text
              style={{
                color: '#888',
              }}
            >
              Made with ❤️
            </Text>
          </View>

          <TouchableOpacity
            onPress={onClose}
            style={{
              marginTop: 25,
              width: '100%',
              backgroundColor: '#7CFC00',
              paddingVertical: 16,
              borderRadius: 18,
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                color: 'black',
                fontWeight: '700',
                fontSize: 17,
              }}
            >
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
