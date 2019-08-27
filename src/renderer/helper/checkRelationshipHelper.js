import {
  storageSetDataPath,
  storageHas,
  storageGet,
  storageSet
} from '../helper/storageHelper'

async function checkRelationship (
  sourceObj,
  resultObj,
  relationshipFrom,
  relationshipTo
) {
  if (sourceObj === undefined || sourceObj === null) {
    console.log('checkRelationship Alert: sourceObj is ' + sourceObj)
    return
  }
  // let relationshipFrom = 'flowContent' || 'labels'
  // let relationshipTo = 'whoOwnMe' || 'labelsFrom'
  console.group(`Check ${relationshipFrom}`)
  let oldKeyArray = sourceObj[relationshipFrom].slice()
  let newKeyArray = resultObj[relationshipFrom].slice().map(obj => obj.id)
  let isSameKeyArray =
    oldKeyArray.sort().toString() === newKeyArray.sort().toString()

  if (isSameKeyArray) {
    console.log('31: isSameKeyArray so return')
    console.groupEnd()
    return
  }

  // check added
  let addedArray = []
  newKeyArray.forEach(key => {
    if (!oldKeyArray.includes(key)) {
      if (key !== undefined && key !== null) {
        addedArray.push(key)
      }
    }
  })
  if (addedArray.length) {
    console.log('新增加的:')
    console.log(addedArray)

    // add self to other's whoOwnMe/tagFrom
    for (let key of addedArray) {
      storageSetDataPath('/temp')
      let hasKey = await storageHas(key)
      console.log('52: hasKey = ' + hasKey)

      // has key in /temp
      if (hasKey) {
        let data = await storageGet(key)
        data[relationshipTo].push(resultObj.id)
        data[relationshipTo] = [...new Set(data[relationshipTo])]
        storageSetDataPath('/temp')
        try {
          console.log(await storageSet(key, data))
        } catch (error) {
          throw error
        }
        console.log('a增加成功!!!')
        console.log(data)
      } else {
        storageSetDataPath('/data')
        hasKey = await storageHas(key)

        // has key in /data
        if (hasKey) {
          let data = await storageGet(key)
          data[relationshipTo].push(resultObj.id)
          data[relationshipTo] = [...new Set(data[relationshipTo])]
          storageSetDataPath('/temp')
          try {
            console.log(await storageSet(key, data))
          } catch (error) {
            throw error
          }
          console.log('b增加成功!!!')
          console.log(data)
        } else {
          // does not has key in /temp and /data
          console.log(`does not has key(${key}) in /temp and /data`)
        }
      }
    }
  }

  // check deleted
  let deletedArray = []
  oldKeyArray.forEach(key => {
    if (!newKeyArray.includes(key)) {
      if (key !== undefined && key !== null) {
        deletedArray.push(key)
      }
    }
  })
  if (deletedArray.length) {
    console.log('新刪除的:')
    console.log(deletedArray)

    // delete self from other's whoOwnMe/tagFrom
    for (let key of deletedArray) {
      storageSetDataPath('/temp')
      let hasKey = await storageHas(key)
      console.log('378: hasKey = ' + hasKey)

      // has key in /temp
      if (hasKey) {
        storageSetDataPath('/temp')
        let data = await storageGet(key)
        data[relationshipTo] = data[relationshipTo].filter(key => {
          return key !== resultObj.id
        })
        storageSetDataPath('/temp')
        await storageSet(key, data)
        console.log('a刪除成功!!!')
        console.log(data)
      } else {
        storageSetDataPath('/data')
        hasKey = await storageHas(key)

        // has key in /data
        if (hasKey) {
          storageSetDataPath('/data')
          let data = await storageGet(key)
          data[relationshipTo] = data[relationshipTo].filter(key => {
            return key !== resultObj.id
          })
          storageSetDataPath('/temp')
          await storageSet(key, data)
          console.log('b刪除成功!!!')
          console.log(data)
        } else {
          // does not has key in /temp and /data
          console.log(`does not has key(${key}) in /temp and /data`)
        }
      }
    }
  }
  console.groupEnd()

  return new Promise((resolve, reject) => {
    resolve('success')
  })
}

export { checkRelationship }
