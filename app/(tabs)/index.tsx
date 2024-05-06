import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  Bubble,
  GiftedChat,
  IMessage,
  Send,
  SystemMessage,
} from "react-native-gifted-chat";
import { Alert, Button, Platform, Pressable, Text, View } from "react-native";
import { Video, ResizeMode, AVPlaybackStatus, Audio } from "expo-av";
import { Ionicons } from "@expo/vector-icons";

const Example = () => {
  const [messages, setMessages] = useState<IMessage[]>([]);
  const video = useRef(null);
  const [status, setStatus] = useState<AVPlaybackStatus>(
    {} as AVPlaybackStatus
  );
  const [sound, setSound] = useState<Audio.Sound>();
  const [recording, setRecording] = useState<Audio.Recording>();
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [uri, setUri] = useState<string | undefined | null>(undefined);
  const [sendAction, setSendAction] = useState("voice");

  const user = {
    _id: 1,
    name: "Developer",
    avatar:
      "https://t4.ftcdn.net/jpg/04/20/52/33/360_F_420523397_nCAMv5H1hPhcW9vgkjIvMOhjn5jC7LVk.jpg",
  };

  const otherUser = {
    _id: 2,
    name: "Robot",
    avatar: "https://img.freepik.com/free-vector/floating-robot_78370-3669.jpg",
  };

  useEffect(() => {
    setMessages([
      {
        _id: 1,
        text: "Hello developer",
        createdAt: new Date(),
        user: otherUser,
        image:
          "https://img.freepik.com/free-vector/floating-robot_78370-3669.jpg",
        video:
          "https://cdn.pixabay.com/video/2024/02/04/199294-909903183_large.mp4",
        audio: "jdfa;djf;/j k;jfdajf",
        // system: true,
        sent: true,
        received: true,
        pending: true,
        quickReplies: {
          type: "radio",
          values: [
            {
              title: "Yes",
              value: "Yes",
            },
            {
              title: "No",
              value: "No",
            },
          ],
        },
      },
    ]);
  }, []);

  const playSound = async () => {
    const { sound } = await Audio.Sound.createAsync({
      uri: uri as string,
    });
    setSound(sound);

    await sound.playAsync();
  };

  useEffect(() => {
    return sound
      ? () => {
          console.log("Unloading Sound");
          sound.unloadAsync();
        }
      : undefined;
  }, [sound]);

  async function startRecording() {
    try {
      if (permissionResponse?.status !== "granted") {
        console.log("Requesting permission..");
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      console.log("Starting recording..");
      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(recording);
      console.log("Recording started");
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    console.log("Stopping recording..");
    setRecording(undefined);
    await recording?.stopAndUnloadAsync();
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
    });
    const uri = recording?.getURI();

    console.log("Recording stopped and stored at", uri);
    setUri(uri);
  }

  const renderSystemMessage = useCallback((props: IMessage) => {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    );
  }, []);

  const onSend = useCallback((messages = [] as IMessage[]) => {
    setMessages((previousMessages) =>
      GiftedChat.append(previousMessages, messages)
    );
  }, []);

  return (
    <GiftedChat
      showAvatarForEveryMessage
      showUserAvatar
      alwaysShowSend
      messages={messages}
      onSend={(messages: IMessage[]) => onSend(messages)}
      user={user}
      renderMessageText={(props) => (
        <Text style={{ marginLeft: 20 }}>{props.currentMessage?.text}</Text>
      )}
      renderSystemMessage={renderSystemMessage}
      keyboardShouldPersistTaps="never"
      inverted={Platform.OS !== "web"}
      renderMessageVideo={() => (
        <View
          style={{
            backgroundColor: "#ecf0f1",
            marginTop: 5,
          }}
        >
          <Video
            ref={video}
            style={{
              width: 230,
              height: 130,
              borderRadius: 20,
            }}
            source={{
              uri: "https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4",
            }}
            useNativeControls
            resizeMode={ResizeMode.CONTAIN}
            isLooping
            onPlaybackStatusUpdate={(status) => setStatus(() => status)}
            shouldPlay={false}
          />
        </View>
      )}
      renderMessageAudio={() => (
        <View style={{ marginTop: 10 }}>
          {uri && (
            <View>
              <Text style={{ marginBottom: 10 }}>
                {sound ? "Playing audio" : "Press button to play audio"}
              </Text>
              <View style={{ flexDirection: "row" }}>
                <Text
                  style={{
                    backgroundColor: "blue",
                    color: "#FFF",
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    marginRight: 5,
                  }}
                  onPress={playSound}
                >
                  Play sound
                </Text>
                <Text
                  style={{
                    backgroundColor: "yellow",
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                    marginRight: 5,
                  }}
                  onPress={() => {
                    sound?.pauseAsync();
                    setSound(undefined);
                  }}
                >
                  Pause
                </Text>

                <Text
                  style={{
                    backgroundColor: "red",
                    color: "#FFF",
                    paddingVertical: 2,
                    paddingHorizontal: 5,
                  }}
                  onPress={() => {
                    sound?.stopAsync(), setSound(undefined);
                  }}
                >
                  Stop
                </Text>
              </View>
            </View>
          )}

          <View style={{ marginTop: 10, width: 150, borderRadius: 5 }}>
            <Button
              title={recording ? "Stop Recording" : "Start Recording"}
              onPress={recording ? stopRecording : startRecording}
            />
          </View>
        </View>
      )}
      // renderBubble={(props) => (
      //   <Bubble
      //     {...props}
      //     wrapperStyle={{
      //       right: {
      //         width: 400,
      //         backgroundColor: "red",
      //       },
      //       left: {
      //         backgroundColor: "red",
      //         width: 400,
      //         marginBottom: 10,
      //       },
      //     }}
      //   />
      // )}
      renderMessage={(props) => (
        <Bubble
          {...props}
          quickReplyStyle={{
            marginLeft: 10,
          }}
          wrapperStyle={{
            left: {
              width: 400,
              paddingLeft: 20,
              marginVertical: 10,
            },
            right: {
              marginBottom: 2,
            },
          }}
          renderCustomView={(props) => (
            <View
              style={{
                paddingTop: 10,
                alignSelf: "flex-start",
                paddingHorizontal: 10,
              }}
            >
              <Text
                onPress={() => Alert.alert("Learn more")}
                style={{
                  backgroundColor: "#f0f",
                  paddingHorizontal: 10,
                  alignSelf: "center",
                  borderRadius: 15,
                  color: "#FFF",
                  paddingVertical: 5,
                }}
              >
                Learn More {props.currentMessage?._id}
              </Text>
            </View>
          )}
        />
      )}
      renderFooter={() => <Text>footer</Text>}
      renderActions={useCallback(
        (props: any) =>
          Platform.OS === "web" ? null : (
            <Pressable
              onPress={() => Alert.alert("Hello")}
              style={{
                alignSelf: "center",
                marginLeft: 5,
                alignItems: "center",
                borderRadius: 15,
                paddingVertical: 5,
                width: 30,
                borderColor: "black",
                borderWidth: 0.2,
              }}
            >
              <Text> + </Text>
            </Pressable>
          ),
        []
      )}
      // renderSend={(props: IMessage) => {
      //   return (
      //     <Send
      //       {...props}
      //       alwaysShowSend={true}
      //       containerStyle={{
      //         alignItems: "center",
      //         justifyContent: "center",
      //         marginRight: 10,
      //       }}
      //     >
      //       <View
      //         style={{
      //           flexDirection: "row",
      //           alignItems: "center",
      //           width: 80,
      //         }}
      //       >
      //         <Pressable
      //           onPress={() => console.log("hie")}
      //           style={{
      //             width: 40,
      //             alignItems: "center",
      //           }}
      //         >
      //           <Ionicons name="mic" size={20} color="#888" />
      //         </Pressable>
      //         <Pressable
      //           onPress={() => console.log("pressed")}
      //           style={{
      //             width: 40,
      //             alignItems: "center",
      //           }}
      //         >
      //           <Ionicons name="send" size={20} color="#888" />
      //         </Pressable>
      //       </View>
      //     </Send>
      //   );
      // }}
    />
  );
};

export default Example;
