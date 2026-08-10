import { Modal, View, Text, TouchableOpacity } from 'react-native';

export default function WarningModal({
  visible,
  icon = '⚠️',
  title = 'Warning',
  message = '',
  confirmText = 'Continue',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
}) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible={visible}
      onRequestClose={onCancel}
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
            borderWidth: 1,
            borderColor: '#FFC107',
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
              color: '#FFC107',
              fontSize: 26,
              fontWeight: 'bold',
              marginTop: 12,
            }}
          >
            {title}
          </Text>

          <Text
            style={{
              color: '#999',
              textAlign: 'center',
              marginTop: 12,
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              gap: 10,
              marginTop: 28,
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#2b2b2b',
                paddingVertical: 16,
                borderRadius: 18,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {cancelText}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onConfirm}
              style={{
                flex: 1,
                backgroundColor: '#FFC107',
                paddingVertical: 16,
                borderRadius: 18,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'black',
                  fontWeight: '700',
                  fontSize: 16,
                }}
              >
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
