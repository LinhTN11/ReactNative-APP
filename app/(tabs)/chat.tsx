import { SOCKET_SERVER_URL } from '@/constants/firebase';
import * as ImagePicker from 'expo-image-picker';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Animated, Image, Modal, PanResponder, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  userId: string;
  userName: string;
  timestamp: number;
  imageUrl?: string;
}

interface UserStatus {
  userId: string;
  userName: string;
  online: boolean;
}

export default function ChatScreen() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [userId, setUserId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<UserStatus[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  
  // Zoom/Pan state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslateX = useRef(0);
  const lastTranslateY = useRef(0);
  const lastTap = useRef<number | null>(null);
  const baseScale = useRef(1);
  const pinchScale = useRef(1);

  // Reset zoom when modal opens
  useEffect(() => {
    if (fullscreenImage) {
      scale.setValue(1);
      translateX.setValue(0);
      translateY.setValue(0);
      lastScale.current = 1;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      baseScale.current = 1;
      pinchScale.current = 1;
    }
  }, [fullscreenImage]);

  // Double tap to zoom
  const handleDoubleTap = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;
    
    if (lastTap.current && now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      const newScale = lastScale.current > 1 ? 1 : 2.5;
      
      Animated.parallel([
        Animated.spring(scale, {
          toValue: newScale,
          useNativeDriver: true,
        }),
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
        }),
      ]).start();
      
      lastScale.current = newScale;
      lastTranslateX.current = 0;
      lastTranslateY.current = 0;
      baseScale.current = newScale;
      lastTap.current = null;
    } else {
      lastTap.current = now;
    }
  };

  // Pan responder for pinch zoom and drag
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2 || lastScale.current > 1,
      onMoveShouldSetPanResponder: (evt) => evt.nativeEvent.touches.length === 2 || lastScale.current > 1,
      onPanResponderGrant: (evt) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch start
          const touches = evt.nativeEvent.touches;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          baseScale.current = Math.sqrt(dx * dx + dy * dy);
        }
        translateX.setOffset(lastTranslateX.current);
        translateY.setOffset(lastTranslateY.current);
      },
      onPanResponderMove: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 2) {
          // Pinch zoom
          const touches = evt.nativeEvent.touches;
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          pinchScale.current = distance / baseScale.current;
          const newScale = Math.max(1, Math.min(lastScale.current * pinchScale.current, 5));
          scale.setValue(newScale);
        } else if (lastScale.current > 1) {
          // Drag when zoomed
          translateX.setValue(gestureState.dx);
          translateY.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (evt, gestureState) => {
        if (evt.nativeEvent.touches.length === 0) {
          lastScale.current = Math.max(1, Math.min((scale as any)._value, 5));
          translateX.flattenOffset();
          translateY.flattenOffset();
          
          lastTranslateX.current = (translateX as any)._value;
          lastTranslateY.current = (translateY as any)._value;
          pinchScale.current = 1;
        }
      },
    })
  ).current;

  useEffect(() => {
    if (!isLoggedIn) return;

    // Connect to Socket.IO server
    const newSocket = io(SOCKET_SERVER_URL, {
      transports: ['websocket'],
    });

    newSocket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      
      // Join chat room
      newSocket.emit('user-join', { userId, userName });
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Listen for new messages
    newSocket.on('new-message', (message: Message) => {
      setMessages(prev => [message, ...prev]);
    });

    // Listen for user online status
    newSocket.on('user-online', (data: { userId: string; userName: string; onlineCount?: number }) => {
      if (data.onlineCount !== undefined) {
        // Update from server's actual count
        setOnlineUsers(Array(data.onlineCount).fill({ userId: '', userName: '', online: true }));
      }
      
      setOnlineUsers(prev => {
        const existing = prev.find(u => u.userId === data.userId);
        if (existing) return prev;
        return [...prev, { userId: data.userId, userName: data.userName, online: true }];
      });
    });

    // Listen for user offline status
    newSocket.on('user-offline', (data: { userId: string; onlineCount?: number }) => {
      if (data.onlineCount !== undefined) {
        // Update from server's actual count
        setOnlineUsers(Array(data.onlineCount).fill({ userId: '', userName: '', online: true }));
      }
      
      setOnlineUsers(prev => prev.filter(u => u.userId !== data.userId));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isLoggedIn, userId, userName]);

  const handleLogin = () => {
    if (!userName.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên đăng nhập');
      return;
    }
    
    if (!password.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập mật khẩu');
      return;
    }

    // Simple validation - trong production nên gọi API backend
    if (password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    // Generate user ID based on username
    const id = `user_${userName}_${Date.now()}`;
    setUserId(id);
    setIsLoggedIn(true);
    Alert.alert('Thành công', `Chào mừng ${userName}!`);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !socket || !isConnected) return;

    const message: Message = {
      id: Date.now().toString(),
      text: newMessage,
      userId,
      userName,
      timestamp: Date.now(),
    };

    socket.emit('send-message', message);
    setNewMessage('');
  };

  const handlePickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.3,
        base64: true,
        allowsMultipleSelection: false,
        // Giảm kích thước ảnh
        exif: false,
      });

      console.log('Image picker result:', result);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Resize nếu quá lớn
        let imageUrl = asset.base64 
          ? `data:image/jpeg;base64,${asset.base64}`
          : asset.uri;

        const sizeInKB = imageUrl.length / 1024;
        console.log('Image size:', sizeInKB.toFixed(2), 'KB');

        if (sizeInKB > 800) {
          Alert.alert('Lỗi', `Ảnh quá lớn (${sizeInKB.toFixed(0)}KB). Vui lòng:\n\n1. Chọn ảnh nhỏ hơn\n2. Crop ảnh nhỏ lại khi chọn\n3. Giảm độ phân giải ảnh`);
          return;
        }

        const imageMessage: Message = {
          id: Date.now().toString(),
          text: '',
          userId,
          userName,
          timestamp: Date.now(),
          imageUrl,
        };

        console.log('Sending image message...');
        
        if (socket && isConnected) {
          socket.emit('send-message', imageMessage);
          console.log('Image message sent!');
        } else {
          console.log('Socket not connected:', { socket: !!socket, isConnected });
          Alert.alert('Lỗi', 'Chưa kết nối đến server');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Lỗi', 'Không thể chọn ảnh');
    }
  };

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        const sizeInMB = (asset.size || 0) / (1024 * 1024);

        if (sizeInMB > 10) {
          Alert.alert('Lỗi', `File quá lớn (${sizeInMB.toFixed(1)}MB). Giới hạn 10MB.`);
          return;
        }

        // For web/mobile: Read file as base64
        const response = await fetch(asset.uri);
        const blob = await response.blob();
        const reader = new FileReader();
        
        reader.onloadend = () => {
          const base64 = reader.result as string;
          
          const fileMessage: Message = {
            id: Date.now().toString(),
            text: '',
            userId,
            userName,
            timestamp: Date.now(),
            fileUrl: base64,
            fileName: asset.name,
            fileType: asset.mimeType || 'application/octet-stream',
          };

          if (socket && isConnected) {
            socket.emit('send-message', fileMessage);
            console.log('File message sent!');
          } else {
            Alert.alert('Lỗi', 'Chưa kết nối đến server');
          }
        };
        
        reader.readAsDataURL(blob);
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Lỗi', 'Không thể chọn file');
    }
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Chat Real-time</Text>
        </View>
        <View style={styles.centerContent}>
          <Text style={styles.emptyIcon}>💬</Text>
          <Text style={styles.emptyTitle}>Đăng nhập Chat</Text>
          <Text style={styles.emptyText}>
            Đăng nhập để bắt đầu chat với mọi người
          </Text>
          <TextInput
            style={styles.loginInput}
            value={userName}
            onChangeText={setUserName}
            placeholder="Tên đăng nhập"
            placeholderTextColor="#666"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.loginInput}
            value={password}
            onChangeText={setPassword}
            placeholder="Mật khẩu (tối thiểu 6 ký tự)"
            placeholderTextColor="#666"
            secureTextEntry
          />
          <TouchableOpacity 
            style={[
              styles.loginButton, 
              (!userName.trim() || !password.trim()) && styles.loginButtonDisabled
            ]} 
            onPress={handleLogin}
            disabled={!userName.trim() || !password.trim()}>
            <Text style={styles.loginButtonText}>Đăng nhập</Text>
          </TouchableOpacity>
          <Text style={styles.loginHint}>
            💡 Nhập bất kỳ tên và mật khẩu (≥6 ký tự)
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Chat Real-time</Text>
          <Text style={styles.subtitle}>
            {isConnected ? (
              <Text style={styles.connectedText}>● Đã kết nối</Text>
            ) : (
              <Text style={styles.disconnectedText}>○ Đang kết nối...</Text>
            )}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={[styles.onlineDot, !isConnected && styles.offlineDot]} />
          <Text style={styles.userName}>{userName}</Text>
        </View>
      </View>

      {onlineUsers.length > 0 && (
        <View style={styles.onlineUsersBar}>
          <Text style={styles.onlineUsersText}>
            👥 Online: {onlineUsers.length} người
          </Text>
        </View>
      )}

      <ScrollView style={styles.messagesList} contentContainerStyle={styles.messagesContent}>
        {messages.length === 0 && (
          <View style={styles.emptyMessages}>
            <Text style={styles.emptyMessagesText}>
              Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện! 💬
            </Text>
          </View>
        )}
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageItem,
              msg.userId === userId ? styles.myMessage : styles.otherMessage,
            ]}>
            <Text style={styles.messageSender}>{msg.userName}</Text>
            {msg.text && <Text style={styles.messageText}>{msg.text}</Text>}
            {msg.imageUrl && (
              <TouchableOpacity onPress={() => setFullscreenImage(msg.imageUrl || null)}>
                <Image source={{ uri: msg.imageUrl }} style={styles.messageImage} />
              </TouchableOpacity>
            )}
            {msg.fileUrl && msg.fileName && (
              <View style={styles.fileAttachment}>
                <Text style={styles.fileIcon}>📄</Text>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={1}>{msg.fileName}</Text>
                  <Text style={styles.fileType}>{msg.fileType?.split('/')[1] || 'file'}</Text>
                </View>
                <TouchableOpacity 
                  style={styles.downloadButton}
                  onPress={() => {
                    // Download file
                    const link = document.createElement('a');
                    link.href = msg.fileUrl || '';
                    link.download = msg.fileName || 'file';
                    link.click();
                  }}>
                  <Text style={styles.downloadButtonText}>⬇️</Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.messageTime}>
              {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={handlePickImage}>
          <Text style={styles.imageButtonText}>📎</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={setNewMessage}
          placeholder="Nhập tin nhắn..."
          placeholderTextColor="#666"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton, 
            (!newMessage.trim() || !isConnected) && styles.sendButtonDisabled
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim() || !isConnected}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>

      {/* Fullscreen Image Modal */}
      <Modal
        visible={!!fullscreenImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setFullscreenImage(null)}>
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1}
            onPress={handleDoubleTap}
            {...panResponder.panHandlers}>
            <Animated.Image 
              source={{ uri: fullscreenImage || '' }} 
              style={[
                styles.fullscreenImage,
                {
                  transform: [
                    { scale },
                    { translateX },
                    { translateY },
                  ],
                },
              ]}
              resizeMode="contain"
            />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setFullscreenImage(null)}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <View style={styles.zoomHint}>
            <Text style={styles.zoomHintText}>👆 Kéo để xem, double tap để zoom</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: 'rgba(10, 10, 10, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 4,
  },
  connectedText: {
    color: '#10b981',
  },
  disconnectedText: {
    color: '#8a8a8a',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    position: 'absolute',
    top: 50,
    right: 20,
  },
  onlineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#666',
  },
  userName: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  onlineUsersBar: {
    backgroundColor: '#1a1a1a',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#2d2d2d',
  },
  onlineUsersText: {
    fontSize: 12,
    color: '#10b981',
  },
  centerContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: '#8a8a8a',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  loginInput: {
    width: '100%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: '#fff',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#2d2d2d',
    marginBottom: 20,
  },
  loginButton: {
    backgroundColor: '#10b981',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
  },
  loginButtonDisabled: {
    backgroundColor: '#2d2d2d',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    flexDirection: 'column-reverse',
  },
  emptyMessages: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyMessagesText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  messageItem: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#10b981',
  },
  otherMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#1a1a1a',
  },
  messageSender: {
    fontSize: 12,
    color: '#8a8a8a',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 20,
  },
  messageImage: {
    width: 200,
    height: 150,
    borderRadius: 8,
    marginTop: 8,
  },
  messageTime: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#2d2d2d',
    alignItems: 'center',
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  attachButtonText: {
    fontSize: 20,
  },
  imageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2d2d2d',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageButtonText: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    backgroundColor: '#2d2d2d',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#10b981',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#2d2d2d',
  },
  sendButtonText: {
    fontSize: 20,
    color: '#fff',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullscreenImage: {
    width: '90%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '700',
  },
  zoomHint: {
    position: 'absolute',
    bottom: 50,
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  zoomHintText: {
    color: '#fff',
    fontSize: 12,
  },
  fileAttachment: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d2d2d',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    gap: 8,
  },
  fileIcon: {
    fontSize: 24,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  fileType: {
    color: '#8a8a8a',
    fontSize: 11,
    marginTop: 2,
  },
  downloadButton: {
    padding: 8,
    backgroundColor: '#10b981',
    borderRadius: 8,
  },
  downloadButtonText: {
    fontSize: 16,
  },
});
