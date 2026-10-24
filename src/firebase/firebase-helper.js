import { get, push, ref, remove, set, update } from 'firebase/database'
import { database } from './firebase.js'


// Example params: path = 'students'
// firabse response:
// [{
//  '-ExampleStudentId': {
//      name: 'Juan Dela Cruz',
//      course: 'BSIT',
//      year: 1,
//      email: 'juan@example.com',
//      favorite: false,
//      present: false
//    }
// }]
// Example response: [{ id: '-ExampleStudentId', name: 'Juan Dela Cruz', course: 'BSIT', year: 1, email: 'juan@example.com', favorite: false, present: false }]
export async function getData(path) {
 const snapshot = await get(ref(database, path))
 const data = snapshot.val() ?? {}


 console.log({ data })


 return Object.entries(data).map(([id, value]) => ({
   ...value,
   id
 }))
}


// Example params:
// path = 'students'
// data = {
//   name: 'Juan Dela Cruz',
//   course: 'BSIT',
//   year: 1,
//   email: 'juan@example.com',
//   favorite: false,
//   present: false
// }
// Firebase response: Promise<void>
// Example response: '-ExampleStudentId'
export async function createData(path, data) {
 const dataReference = push(ref(database, path))
 // replace the whole data at the new reference with the provided data
 // example:
 // old data: {}
 // new data: {name: "Juan Dela Cruz", favorite: false}
 var response = await set(dataReference, data)
 console.log({ response })
 return dataReference.key
}


// Example params:
// path = 'students'
// id = '-ExampleStudentId'
// changes = { favorite: true }
// Example response: Promise<void> (resolves when the update completes)
export async function updateData(path, id, changes) {
 // update the data at the specified reference with the provided changes
 // example:
 // > old data: {name: "Juan Dela Cruz", favorite: false}
 // > changes: { favorite: true }
 // > new data: {name: "Juan Dela Cruz", favorite: true}
 var response = await update(ref(database, `${path}/${id}`), changes)
 console.log({ response })
 return response
}


// Example params: path = 'students', id = '-ExampleStudentId'
// Example response: Promise<void> (resolves when the delete completes)
export async function deleteData(path, id) {
 var response = await remove(ref(database, `${path}/${id}`))
 console.log({ response })
 return response
}
