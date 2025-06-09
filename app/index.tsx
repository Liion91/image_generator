import { Colors } from "@/utils/color";
import { getImageDimansion } from "@/utils/helper";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import * as FileSystem from "expo-file-system";
import * as MediaLibrary from "expo-media-library";
import { Stack } from "expo-router";
import * as Sharing from "expo-sharing";
import moment from "moment";
import { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Config from "react-native-config";
import { Dropdown } from "react-native-element-dropdown";

const examplePrompts = [
  "A futuristic city skyline at sunset",
  "A serene forest with a river running through it",
  "A majestic mountain range with snow-capped peaks",
  "A bustling marketplace in a medieval town",
  "A tranquil beach with crystal clear waters",
];

const modelData = [
  { label: "flux.1-dev", model: "black-forest-labs/FLUX.1-dev" },
  { label: "FLUX.1-schnell", model: "black-forest-labs/FLUX.1-schnell" },
  {
    label: "stable diffusion 3.5L",
    model: "stabilityai/stable-diffusion-3.5-large",
  },
  {
    label: "stable diffusion XL",
    model: "stabilityai/stable-diffusion-xl-base-1.0",
  },
  {
    label: "stable diffusion 1.5",
    model: "stable-diffusion-v1-5/stable-diffusion-v1-5",
  },
];

const aspectRatioData = [
  { label: "1:1", value: "1/1" },
  { label: "4:3", value: "4/3" },
  { label: "16:9", value: "16/9" },
  { label: "9:16", value: "9/16" },
];

export default function Index() {
  const [prompt, setPrompt] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [aspectRatio, setAspectRatio] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  const generatePrompt = () => {
    setPrompt(
      examplePrompts[Math.floor(Math.random() * examplePrompts.length)]
    );
  };

  const generateImage = async () => {
    if (!prompt || !model || !aspectRatio) {
      alert("Please fill in all fields");
      return;
    }
    setIsLoading(true);
    try {
      const ModelUrl = `${Config.HF_URL}${model}`;
      // const ModelUrl = `https://router.huggingface.co/hf-inference/models/${model}`;
      const { width, height } = getImageDimansion(aspectRatio);
      const apiKey = Config.HF_TOKEN;
      console.log("api key:", apiKey);

      const response = await fetch(ModelUrl, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            width,
            height,
          },
        }),
      });

      if (!response.ok) throw new Error((await response.json()).error);

      const blob = await response.blob();
      console.log("blob", blob);

      const fileReader = new FileReader();
      fileReader.readAsDataURL(blob);
      fileReader.onload = () => {
        const base64Image = fileReader.result as string;
        console.log("base64Image", base64Image);
        setImageUrl(base64Image); // Assuming you have a state to hold the image source
        console.log(`Image generated successfully: ${base64Image}`);
        setIsLoading(false);
      };
    } catch (error) {
      console.error("Error generating image:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const base64Code = imageUrl.split(",")[1];
    const date = moment().format("YYYYMMDDhhmmss");

    try {
      const fileName = FileSystem.documentDirectory + `${date}.jpeg`;
      await FileSystem.writeAsStringAsync(fileName, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const asset = await MediaLibrary.saveToLibraryAsync(fileName);
      console.log("Image saved to library:", asset);
      alert("Image downloaded successfully!");
    } catch (error) {
      console.log("Error downloading image:", error);
    }
  };

  const handleShare = async () => {
    const base64Code = imageUrl.split(",")[1];
    const date = moment().format("YYYYMMDDhhmmss");

    try {
      const fileName = FileSystem.documentDirectory + `${date}.jpeg`;
      await FileSystem.writeAsStringAsync(fileName, base64Code, {
        encoding: FileSystem.EncodingType.Base64,
      });

      Sharing.shareAsync(fileName);
    } catch (error) {
      console.log("Error downloading image:", error);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: "Ai Image Generator",
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { color: Colors.text, fontWeight: "bold" },
        }}
      />
      <ScrollView>
        <View style={styles.container}>
          <View style={{ height: 250 }}>
            <TextInput
              placeholder="Describe your imaginaton.."
              placeholderTextColor={Colors.placeholder}
              style={styles.inputField}
              numberOfLines={3}
              multiline
              value={prompt}
              onChangeText={(text) => setPrompt(text)}
            />
            <TouchableOpacity
              onPress={() => {
                generatePrompt();
              }}
            >
              <FontAwesome5
                name="dice"
                size={20}
                color={Colors.black}
                style={styles.ideaBtn}
              />
            </TouchableOpacity>
          </View>
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={modelData}
            maxHeight={300}
            labelField="label"
            valueField="model"
            placeholder="Select Model"
            value={model}
            onChange={(item) => {
              setModel(item.model);
            }}
          />
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            data={aspectRatioData}
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder="Select ratio"
            value={aspectRatio}
            onChange={(item) => {
              setAspectRatio(item.value);
            }}
          />
          <TouchableOpacity
            style={styles.button}
            onPress={() => {
              generateImage();
            }}
          >
            <Text style={styles.btnText}>Generate</Text>
          </TouchableOpacity>

          {isLoading && (
            <View
              style={[
                styles.imageContainer,
                { justifyContent: "center", alignItems: "center" },
              ]}
            >
              <ActivityIndicator size={"large"} />
            </View>
          )}
          {imageUrl && (
            <>
              <View style={styles.imageContainer}>
                <Image source={{ uri: imageUrl }} style={styles.image} />
              </View>
              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  onPress={() => {
                    handleDownload();
                  }}
                >
                  <FontAwesome5
                    name="download"
                    size={20}
                    color={Colors.black}
                    style={styles.btnDownload}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    handleShare();
                  }}
                >
                  <FontAwesome5
                    name="share"
                    size={20}
                    color={Colors.black}
                    style={styles.btnDownload}
                  />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const windowWidth = Dimensions.get("window").width;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: Colors.background,
  },
  inputField: {
    backgroundColor: Colors.dark,
    padding: 20,
    borderRadius: 10,
    borderColor: Colors.accent,
    borderWidth: StyleSheet.hairlineWidth,
    fontSize: 16,
    fontWeight: 500,
    letterSpacing: 0.2,
    height: 250,
    color: Colors.text,
  },
  ideaBtn: {
    backgroundColor: Colors.accent,
    padding: 16,
    borderRadius: "50%",
    alignSelf: "flex-end",
    position: "relative",
    bottom: 60,
    right: 20,
  },
  dropdown: {
    marginTop: 20,
    height: 50,
    backgroundColor: Colors.dark,
    borderRadius: 10,
    borderColor: Colors.accent,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  placeholderStyle: {
    fontSize: 16,
    color: Colors.placeholder,
  },
  selectedTextStyle: {
    fontSize: 16,
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.accent,
    padding: 12,
    marginTop: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  btnText: {
    color: Colors.black,
    fontSize: 18,
    fontWeight: 700,
    letterSpacing: 1.2,
  },
  imageContainer: {
    height: 300,
    width: windowWidth - 40,
    marginTop: 20,
    borderRadius: 10,
    borderColor: Colors.accent,
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: {
    flex: 1,
    resizeMode: "contain",
    width: "100%",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 10,
  },
  btnDownload: {
    height: 45,
    width: 45,
    borderRadius: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.4)",
    justifyContent: "center",
    alignItems: "center",
    display:"flex"
  },
});
