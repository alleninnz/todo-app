export const ErrorPage = ({ statusCode }: { statusCode?: number }) => {
  return <div>{statusCode === 404 ? '404 Not Found' : 'An error occurred'}</div>
}
