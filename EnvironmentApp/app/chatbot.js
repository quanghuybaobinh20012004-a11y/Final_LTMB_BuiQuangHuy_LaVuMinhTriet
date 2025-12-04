import React, { useState, useRef, useEffect } from 'react';
import { View, FlatList, TextInput, KeyboardAvoidingView, Platform, Keyboard, Alert, TouchableOpacity } from 'react-native';
import { Text, ActivityIndicator, IconButton, Avatar, Chip } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { auth, db } from '../firebaseConfig';
import { addDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';

import { styles } from '../styles/chatbot.styles';

// Lấy key từ biến môi trường.
const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY; 

export default function ChatbotScreen() {
  const router = useRouter();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Chào bạn! Tôi là trợ lý môi trường AI. Bạn cần giúp gì không?', sender: 'bot', timestamp: Date.now() }
  ]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [recording, setRecording] = useState(null);
  const flatListRef = useRef(null);

  useEffect(() => {
    const loadHistory = async () => {
      const user = auth.currentUser;
      if (!user) return;
      try {
        const q = query(collection(db, `users/${user.uid}/chatHistory`), orderBy('timestamp', 'desc'), limit(15));
        const snapshot = await getDocs(q);
        const history = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })).reverse();
        if (history.length > 0) setMessages(prev => [...prev, ...history.slice(1)]);
      } catch (error) {
        console.log("Lỗi tải lịch sử chat:", error);
      }
    };
    loadHistory();

    return () => {
      Speech.stop();
      if (recording) recording.stopAndUnloadAsync();
    };
  }, []);

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== 'granted') {
        Alert.alert("Lỗi", "Cần quyền truy cập Microphone.");
        return;
      }

      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });

      const recordingOptions = {
        android: {
          extension: '.m4a',
          outputFormat: Audio.AndroidOutputFormat.MPEG_4,
          audioEncoder: Audio.AndroidAudioEncoder.AAC,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
        },
        ios: {
          extension: '.m4a',
          audioQuality: Audio.IOSAudioQuality.HIGH,
          sampleRate: 44100,
          numberOfChannels: 2,
          bitRate: 128000,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        },
        web: {
          mimeType: 'audio/webm',
          bitsPerSecond: 128000,
        },
      };

      const { recording } = await Audio.Recording.createAsync(recordingOptions);
      setRecording(recording);
    } catch (err) {
      console.error("Lỗi ghi âm:", err);
      Alert.alert('Lỗi', 'Không thể ghi âm.');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);
      if (uri) handleSendAudio(uri);
    } catch (err) {
      console.error("Lỗi dừng ghi âm:", err);
    }
  };

  const handleSendAudio = async (uri) => {
    const user = auth.currentUser;
    const userMsg = { id: Date.now().toString(), text: "🎤 (Đang gửi giọng nói...)", sender: 'user', timestamp: Date.now(), isAudio: true };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
        const base64Audio = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

        const response = await fetch(
            // ĐÃ SỬA: Dùng API Key qua query parameter
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                    contents: [{
                        parts: [
                            { text: "Hãy nghe đoạn âm thanh này và trả lời câu hỏi của người dùng một cách ngắn gọn, thân thiện bằng tiếng Việt." },
                            { inline_data: { mime_type: "audio/m4a", data: base64Audio } }
                        ]
                    }]
                })
            }
        );

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message || "Lỗi từ Gemini API");
        
        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Tôi không nghe rõ, bạn nói lại được không?";
        
        const botMsg = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);

        if (user) addDoc(collection(db, `users/${user.uid}/chatHistory`), botMsg);
        speakText(botText);

    } catch (error) {
        console.error("Lỗi xử lý audio:", error);
        Alert.alert("Lỗi AI", error.message || "Không thể xử lý âm thanh.");
    } finally {
        setLoading(false);
    }
  };

  const sendMessage = async (customText) => {
    const textToSend = customText || inputText;
    if (!textToSend.trim()) return;

    const user = auth.currentUser;
    const userMsg = { id: Date.now().toString(), text: textToSend, sender: 'user', timestamp: Date.now() };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    Keyboard.dismiss();
    Speech.stop();
    setIsSpeaking(false);

    if (user) addDoc(collection(db, `users/${user.uid}/chatHistory`), userMsg);

    setLoading(true);
    try {
        const response = await fetch(
            // ĐÃ SỬA: Dùng API Key qua query parameter
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify({
                    contents: [{ parts: [{ text: `Bạn là chuyên gia môi trường. Hãy trả lời ngắn gọn: ${textToSend}` }] }]
                })
            }
        );

        const data = await response.json();
        if (data.error) throw new Error(data.error.message);

        const botText = data.candidates?.[0]?.content?.parts?.[0]?.text || "Lỗi kết nối AI.";
        const botMsg = { id: (Date.now() + 1).toString(), text: botText, sender: 'bot', timestamp: Date.now() };
        setMessages(prev => [...prev, botMsg]);
        if (user) addDoc(collection(db, `users/${user.uid}/chatHistory`), botMsg);
        speakText(botText);

    } catch (error) {
        console.error("Lỗi chat text:", error);
        Alert.alert("Lỗi", "AI không phản hồi.");
    } finally {
        setLoading(false);
    }
  };

  const speakText = (text) => {
    setIsSpeaking(true);
    Speech.speak(text, {
      language: 'vi-VN',
      rate: 0.9,
      onDone: () => setIsSpeaking(false),
      onStopped: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false)
    });
  };

  const stopSpeaking = () => { Speech.stop(); setIsSpeaking(false); };

  const renderMessage = ({ item }) => {
    const isUser = item.sender === 'user';
    return (
      <View style={[styles.msgContainer, isUser ? styles.msgRight : styles.msgLeft]}>
        {!isUser && <Avatar.Icon size={32} icon="leaf" style={styles.botAvatar} color="#0E4626" />}
        <View style={isUser ? styles.bubbleRight : styles.bubbleLeft}>
          <Text style={isUser ? styles.textRight : styles.textLeft}>{item.text}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <View style={styles.headerBar}>
        <IconButton icon="arrow-left" onPress={() => router.back()} iconColor="#0E4626" size={26} style={styles.backBtn} />
        <Text style={styles.headerTitle}>Trợ lý AI</Text>
        {isSpeaking && <IconButton icon="volume-off" onPress={stopSpeaking} iconColor="#D32F2F" size={24} />}
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.chatContent}
        style={{ flex: 1 }}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        ListFooterComponent={loading ? <ActivityIndicator size="small" color="#0E4626" style={{ marginTop: 10 }} /> : null}
      />

      <View style={{ maxHeight: 50 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={["Cách tái chế pin?", "Phân loại rác nhựa?", "Mẹo tiết kiệm điện"]}
          contentContainerStyle={styles.chipContainer}
          renderItem={({ item }) => (
            <Chip onPress={() => sendMessage(item)} style={styles.chipItem} textStyle={styles.chipText} icon="sprout">
              {item}
            </Chip>
          )}
        />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        {recording && <Text style={styles.recordingText}>Đang nghe... (Thả tay để gửi)</Text>}

        <View style={styles.inputWrapper}>
          <TouchableOpacity
            onPressIn={startRecording}
            onPressOut={stopRecording}
            style={[styles.micBtn, recording ? styles.micBtnActive : null]}
          >
            <IconButton icon="microphone" iconColor={recording ? '#D32F2F' : '#0E4626'} size={24} style={{ margin: 0 }} />
          </TouchableOpacity>

          <TextInput
            style={[styles.textInput, { maxHeight: 100 }]}
            placeholder="Nhập câu hỏi..."
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={() => sendMessage()}
            editable={!recording}
            placeholderTextColor="#999"
            multiline
          />

          <TouchableOpacity
            style={[styles.sendBtn, { opacity: (!inputText.trim() && !loading) ? 0.5 : 1 }]}
            onPress={() => sendMessage()}
            disabled={loading || !inputText.trim()}
          >
            <IconButton icon="send" iconColor="#fff" size={20} style={{ margin: 0 }} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}