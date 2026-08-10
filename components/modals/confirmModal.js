import { Modal, View, Text, TouchableOpacity } from 'react-native';

export default function ConfirmModal({
  visible,
  icon = '⚠️',
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = '#7CFC00',
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
          }}
        >
          <Text
            style={{
              fontSize: 60,
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
              fontSize: 16,
              lineHeight: 22,
            }}
          >
            {message}
          </Text>

          <View
            style={{
              flexDirection: 'row',
              marginTop: 30,
              gap: 12,
            }}
          >
            <TouchableOpacity
              onPress={onCancel}
              style={{
                flex: 1,
                backgroundColor: '#2b2b2b',
                paddingVertical: 15,
                borderRadius: 18,
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  color: 'white',
                  fontWeight: '600',
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
                backgroundColor: confirmColor,
                paddingVertical: 15,
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
