export default function m (...args) {
  if (args.length === 0) {
    return
  }

  const types = {}
  
  args
    .forEach((arg, index) => {
      const type = getType(arg)
      if (types[type]) {
        types[type].push(index)
      } else {
        types[type] = [ index ]
      }
    })
  
  let i
  let children
  if (types['array']) {
    i = types['array'][0]
    children = args[i]
  }

  let props
  if (types['object']) {
    i = types['object'][0]
    props = args[i]
  }

  if (types['element'] && types['element'].length > 0) {
    i = types['element'][0]
    const element = args[i]

    let content
    if (types['string']) {
      i = types['string'][0]
      content = args[i]
    }

    return fillElement(element, props, content, children)
  } else if (types['string'] && types['string'].length > 0) {
    i = types['string'][0]
    const tagName = args[i]

    let content
    if (types['string'].length > 1) {
      i = types['string'][1]
      content = args[i]
    }

    return createElement(tagName, props, content, children)
  }

  return
}

function getType (atom) {
  if (typeof atom === 'string') {
    return 'string'
  } else if (typeof atom === 'object') {
    if (Array.isArray(atom)) {
      return 'array'
    }
    if (atom instanceof Element) {
      return 'element'
    }
    return 'object'
  }
}

function createElement (tagName, props, content, children) {
  const element = document.createElement(tagName)

  return fillElement(element, props, content, children)
}

function fillElement (element, props = {}, content, children = []) {
  for (const key in props) {
    if (Object.hasOwnProperty.call(props, key)) {
      const value = props[key]
      element[key] = value
    }
  }

  if (content) {
    element.innerText = content
  }

  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    if (child instanceof Node) {
      element.appendChild(child)
    }
  }

  return element
}