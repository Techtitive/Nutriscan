import { Modal, View, Text, ActivityIndicator } from 'react-native';

export default function LoadingModal({
  visible,
  icon = '⏳',
  title = 'Please wait',
  message = 'Processing...',
}) {
  return (
    <Modal transparent animationType="fade" visible={visible}>
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
            padding: 30,
            alignItems: 'center',
          }}
        >
          <Text
            style={{
              fontSize: 58,
            }}
          >
            {icon}
          </Text>

          <Text
            style={{
              color: 'white',
              fontSize: 25,
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
              marginTop: 10,
              marginBottom: 30,
              fontSize: 16,
            }}
          >
            {message}
          </Text>

          <ActivityIndicator size="large" color="#7CFC00" />
        </View>
      </View>
    </Modal>
  );
}
