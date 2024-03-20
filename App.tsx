import React, { useState, useEffect } from "react"
import {
	StyleSheet,
	Text,
	View,
	TextInput,
	TouchableOpacity,
} from "react-native"
import config from "./src/aws-exports"
import { generateClient } from "aws-amplify/api"
import { createTodo, deleteTodo, updateTodo } from "./src/graphql/mutations"
import { listTodos } from "./src/graphql/queries"
import { Amplify } from "aws-amplify"

Amplify.configure(config)

// Interface for Todo Item
interface Todo {
	id: string // Added ID for identification
	name: string
}

const App: React.FC = () => {
	// Use useState hook for state management
	const [name, setName] = useState<string>("")
	const [todos, setTodos] = useState<Todo[]>([])
	const [editingTodoId, setEditingTodoId] = useState<string | null>(null)
	const [newTodoName, setNewTodoName] = useState("")

	const client = generateClient()

	const onChangeText = (val: string) => {
		setName(val)
	}

	const addTodo = async () => {
		if (!name) return // Handle empty input

		try {
			const input = { name }
			const result = await client.graphql({
				query: createTodo,
				variables: {
					input,
				},
			})
			const newTodo = result.data.createTodo
			setTodos([...todos, newTodo]) // Update state with new todo
		} catch (err) {
			console.error("Error creating todo:", err)
			// Handle errors appropriately (e.g., display error message)
		} finally {
			setName("") // Clear input after adding
		}
	}

	const handleDeleteTodo = async (id: string) => {
		try {
			const input = { id }
			await client.graphql({
				query: deleteTodo,
				variables: {
					input,
				},
			})
			setTodos(todos.filter((todo) => todo.id !== id)) // Update state with deleted todo
		} catch (err) {
			console.error("Error deleting todo:", err)
			// Handle errors appropriately (e.g., display error message)
		}
	}

const handleUpdateTodo = async () => {
    if (!editingTodoId) return

    try {
      const input = { id: editingTodoId, name: newTodoName }

      await client.graphql({
        query: updateTodo, 
        variables: { input }, 
      })

        // Update the local state for immediate UI feedback
        setTodos(todos.map((todo) =>
            todo.id === editingTodoId ? { ...todo, name: newTodoName } : todo
        ))
    } catch (err) {
      console.error("Error updating todo:", err)
      // Consider displaying an error message to the user
    } finally {
      setEditingTodoId(null)
      setNewTodoName("")
    }
}


	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const client = generateClient()
				const todosData = await client.graphql({ query: listTodos })
				setTodos(todosData.data.listTodos.items)
			} catch (err) {
				console.error("Error fetching todos:", err)
			}
		}

		fetchTodos()
	}, []) // Empty dependency array to run only on mount

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				value={name}
				onChangeText={onChangeText}
				placeholder="Add a Todo"
			/>
			<TouchableOpacity onPress={addTodo} style={styles.buttonContainer}>
				<Text style={styles.buttonText}>Add +</Text>
			</TouchableOpacity>
			{todos.map((todo) => (
				<View key={todo.id} style={styles.todo}>
					{editingTodoId === todo.id ? (
						<TextInput
							style={styles.input}
							value={newTodoName}
							onChangeText={setNewTodoName}
							placeholder="Edit Todo"
						/>
					) : (
						<Text style={styles.name}>{todo.name}</Text>
					)}

					<TouchableOpacity onPress={() => setEditingTodoId(todo.id)}>
						<Text style={styles.editButton}>Edit</Text>
					</TouchableOpacity>

					{editingTodoId === todo.id && (
						<>
							<TouchableOpacity onPress={handleUpdateTodo}>
								<Text style={styles.updateButton}>Update</Text>
							</TouchableOpacity>

							<TouchableOpacity
								onPress={() => {
									setEditingTodoId(null)
									setNewTodoName("")
								}}
							>
								<Text style={styles.cancelButton}>Cancel</Text>
							</TouchableOpacity>
						</>
					)}

					<TouchableOpacity onPress={() => handleDeleteTodo(todo.id)}>
						<Text style={styles.deleteButton}>Delete</Text>
					</TouchableOpacity>
				</View>
			))}
		</View>
	)
}

export default App

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "#fff",
		paddingHorizontal: 10,
		paddingTop: 50,
	},
	input: {
		height: 50,
		borderBottomWidth: 2,
		borderBottomColor: "blue",
		marginVertical: 10,
	},
	buttonContainer: {
		backgroundColor: "#34495e",
		marginTop: 10,
		marginBottom: 10,
		padding: 10,
		borderRadius: 5,
		alignItems: "center",
	},
	buttonText: {
		color: "#fff",
		fontSize: 24,
	},
	todo: {
		borderBottomWidth: 1,
		borderBottomColor: "#ddd",
		paddingVertical: 10,
	},
	name: { fontSize: 16 },
	deleteButton: {
		color: "red",
	},
	editButton: {
		color: "blue",
	},
	updateButton: {
		backgroundColor: "green",
		color: "#fff",
		padding: 5,
		borderRadius: 5,
		marginTop: 5,
	},
	cancelButton: {
		backgroundColor: "orange",
		color: "#fff",
		padding: 5,
		borderRadius: 5,
		marginTop: 5,
	},
})
