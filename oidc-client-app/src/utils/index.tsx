const MESSAGE_ENV_NOT_SET = 'Environment variable setting incorrect.'

export const assert = (value: string | undefined, msg = MESSAGE_ENV_NOT_SET) => {
  if (value == null) throw new Error(msg)
  return value
}
