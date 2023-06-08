exports.handler = async (event) => {
  const token = event.authorizationToken
  const methodArn = event.methodArn
  const principalId = 'user'

  try {
    if (!token) throw new Error('Token is missing.')
    const { user_id, user_name, email } = jwt.verify(
      token,
      process.env.JWT_SECRET
    )

    if (!user_id || !user_name || !email) {
      throw new Error('invlaid token!')
    }
    const found = await getUserByEmail(email)

    if (
      found === null ||
      found.user_id !== user_id ||
      found.user_name !== user_name
    ) {
      throw new Error('invalid token!')
    }
    return {
      ...generateAuthResponse(principalId, 'Allow', methodArn),
      context: {
        app_user_id: user_id,
        app_user_name: user_name,
        email,
      },
    }
  } catch (error) {
    console.error('Invalid token', error)
    return generateAuthResponse(principalId, 'Deny', methodArn)
  }
}

async function getUserByEmail(email) {
  const params = {
    TableName: tableName,
    IndexName: 'email-index',
    Key: {
      email: email,
    },
  }

  try {
    const data = await dynamodb.get(params).promise()
    if (data.Item) {
      return data.Item
    } else {
      throw new Error('Sign in failed: Please sign up first')
    }
  } catch (error) {
    throw error
  }
}
