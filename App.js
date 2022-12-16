import AsyncStorage from "@react-native-async-storage/async-storage";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Platform,
  Image,
} from "react-native";
import { theme } from "./colors";
import { Feather } from "@expo/vector-icons";

const STORAGE_KEY = "@todos";
const MODE_KEY = "@working";

export default function App() {
  const [completed, setCompleted] = useState(null);
  const [working, setWorking] = useState(true);
  const [text, setText] = useState("");
  const [edit, setEdit] = useState("");
  const [isEdit, setIsEdit] = useState(null);
  const [todos, setTodos] = useState({});
  const travel = () => setWorking(false);
  const work = () => setWorking(true);
  const onChangeText = (payload) => setText(payload);
  const onEditText = (payload) => setEdit(payload);
  const saveTodos = async (toSave) => {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
  };
  const saveModes = async () => {
    await AsyncStorage.setItem(MODE_KEY, JSON.stringify(working));
  };
  const loadTodo = async () => {
    try {
      const s = await AsyncStorage.getItem(STORAGE_KEY);
      if (s) {
        // null값 오류 방지
        setTodos(JSON.parse(s));
      }
    } catch (e) {
      alert(`오류: ${e}`);
    }
  };
  const loadMode = async () => {
    try {
      const m = await AsyncStorage.getItem(MODE_KEY);
      if (m) {
        setWorking(JSON.parse(m));
      }
    } catch (e) {
      alert(`오류: ${e}`);
    }
  };
  useEffect(() => {
    loadTodo();
    loadMode();
  }, []);
  useEffect(() => {
    saveModes();
  }, [working]);
  const addMode = async () => {
    const newModes = { [Date.now()]: { working } };
    if (newModes) {
      setWorking(true);
    } else {
      setWorking(false);
    }
    await saveModes(newModes);
  };
  const addTodo = async () => {
    if (text === "") {
      return;
    }
    const newTodos = {
      ...todos,
      [Date.now()]: { text, working, completed, isEdit },
    };
    setTodos(newTodos);
    await saveTodos(newTodos);
    setText("");
  };
  const deleteTodo = async (key) => {
    if (Platform.OS === "web") {
      const ok = confirm("이 항목을 삭제하겠습니까?");
      if (ok) {
        const newTodos = { ...todos };
        delete newTodos[key];
        setTodos(newTodos);
        await saveTodos(newTodos);
      }
    } else {
      Alert.alert("이 항목을 삭제합니다", "확실합니까?", [
        { text: "취소" },
        {
          text: "삭제",
          onPress: async () => {
            const newTodos = { ...todos };
            delete newTodos[key];
            setTodos(newTodos);
            await saveTodos(newTodos);
          },
        },
      ]);
    }
    return;
  };
  const updateTodo = async (key) => {
    if (text === "") {
      return;
    }
    const newTodos = { ...todos };
    newTodos[key].text = edit;
    setTodos(newTodos);
    await saveTodos(newTodos);
    setIsEdit(null);
  };
  const changeInput = async (key) => {
    const newTodos = { ...todos };
    if (!newTodos[key].isEdit) {
      newTodos[key].isEdit = true;
    } else {
      newTodos[key].isEdit = null;
    }
    setIsEdit((e) => {
      return e === key ? null : key;
    });
  };
  const completeTodo = async (key) => {
    const newTodos = { ...todos };
    if (!newTodos[key].completed) {
      newTodos[key].completed = true;
    } else {
      newTodos[key].completed = null;
    }
    setCompleted((e) => {
      return e === key ? null : key;
    });
    console.log(newTodos);
    setTodos(newTodos);
    await saveTodos(newTodos);
  };
  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.header}>
        <TouchableOpacity onPress={work} onPressOut={addMode}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "500",
              color: working ? "white" : theme.grey,
            }}
          >
            Work
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={travel} onPressOut={addMode}>
          <Text
            style={{
              fontSize: 38,
              fontWeight: "500",
              color: !working ? "white" : theme.grey,
            }}
          >
            Travel
          </Text>
        </TouchableOpacity>
      </View>
      <TextInput
        onChangeText={onChangeText}
        onSubmitEditing={addTodo}
        returnKeyType="done"
        value={text}
        placeholder={working ? "할일 추가" : "어디로 가고 싶나요?"}
        style={styles.input}
        maxLength={15}
      />
      <ScrollView>
        {Object.keys(todos).map((key) =>
          todos[key].working === working ? (
            <View style={styles.todo} key={key}>
              <View style={styles.list}>
                <TouchableOpacity
                  style={{
                    borderRadius: 10,
                    marginRight: 10,
                  }}
                  onPress={() => {
                    completeTodo(key);
                  }}
                >
                  <Image
                    source={
                      todos[key].completed
                        ? require("./assets/check.png")
                        : require("./assets/circle.png")
                    }
                    style={{ width: 20, height: 20 }}
                  />
                </TouchableOpacity>
                {isEdit === key ? (
                  <TextInput
                    onChangeText={onEditText}
                    onSubmitEditing={() => {
                      updateTodo(key);
                    }}
                    returnKeyType="done"
                    style={styles.editInput}
                    defaultValue={todos[key].text}
                    maxLength={15}
                    autoFocus={true}
                  />
                ) : (
                  <Text
                    style={{
                      color: todos[key].completed ? theme.lightGrey : "white",
                      fontSize: 16,
                      fontWeight: "500",
                      textDecorationLine: todos[key].completed
                        ? "line-through"
                        : "none",
                    }}
                  >
                    {todos[key].text}
                  </Text>
                )}
              </View>
              <View style={styles.button}>
                <TouchableOpacity
                  onPress={() => {
                    changeInput(key);
                  }}
                  style={styles.editBtn}
                >
                  <Feather name="edit" size={20} color={theme.lightGrey} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    deleteTodo(key);
                  }}
                >
                  <Feather name="trash-2" size={20} color={theme.lightGrey} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.bg,
    paddingHorizontal: 20,
  },
  header: {
    justifyContent: "space-between",
    flexDirection: "row",
    marginTop: 100,
  },
  input: {
    backgroundColor: "white",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    fontSize: 10,
  },
  todo: {
    backgroundColor: theme.grey,
    marginBottom: 10,
    paddingVertical: 20,
    paddingHorizontal: 20,
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  list: {
    flexDirection: "row",
    alignItems: "center",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    color: theme.lightGrey,
  },
  editInput: {
    color: "white",
    fontSize: 16,
    fontWeight: "500",
    width: "auto",
  },
  editBtn: {
    marginRight: 15,
  },
});
