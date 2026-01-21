namespace Cinema.DBManager.Entities
{
    public class Korisnik
    {
        public string Username { get; set; }
        public string Ime { get; set; }
        public string Prezime { get; set; }
        public int Godine { get; set; }
        public string Password { get; set; }
        public string Role { get; set; }
    }
}