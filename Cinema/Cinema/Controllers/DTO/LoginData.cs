namespace Cinema.Controllers.DTO
{
    public class LoginData
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }

    public class TokenData
    {
        public string Username { get; set; }
        public string Role { get; set; }
        public string InvalidMessage { get; set; }
        public bool IsAuthenticated { get; set; }
    }

    public class DBResponse
    {
        public string Message { get; set; }
        public bool Success { get; set; }
    }

    public class TokenResponse
    {
        public string Token { get; set; }
        public string Username { get; set; }
        public string Role { get; set; }
        public bool IsAuthenticated { get; set; }
        public string InvalidMessage { get; set; }
    }
}
