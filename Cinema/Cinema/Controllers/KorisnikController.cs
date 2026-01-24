using Cinema.DBManager.Providers;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.FileProviders;
using Cinema.DBManager.Entities;
using Cinema.Controllers.DTO;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using BCrypt.Net;

namespace Cinema.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class KorisnikController : ControllerBase
    {
        KorisnikProvider korisnikProvider { get; set; }
        private readonly IConfiguration _config; 

        public KorisnikController(IConfiguration config, KorisnikProvider k)
        {
            _config = config;
            korisnikProvider = k;
        }

        [Authorize]
        [HttpGet("Podaci/{username}")]
        public async Task<IActionResult> VratiPodatke(string username)
        {
            try
            {
                return Ok(korisnikProvider.UserData(username));
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [AllowAnonymous]
        [HttpPost("Registracija")]
        public async Task<IActionResult> SignUp([FromBody]Korisnik user)
        {
            try
            {
                var response = korisnikProvider.InsertUser(user);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesna registracija");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [HttpGet("SviKorisnici")]
        public IActionResult SviKorisnici()
        {
            try
            {
                return Ok(korisnikProvider.GetAllUsers());
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
        [AllowAnonymous]
        [HttpPost("Prijava")]
        public async Task<IActionResult> LogIn([FromBody] LoginData user)
        {
            try
            {
                var tokenData = korisnikProvider.ConfirmUser(new LoginData
                {
                    Username = user.Username,
                    Password = user.Password
                });

                if (tokenData == null || !tokenData.IsAuthenticated)
                {
                    return Unauthorized(new TokenResponse
                    {
                        IsAuthenticated = false,
                        InvalidMessage = tokenData?.InvalidMessage ?? "Greška prilikom autentikacije"
                    });
                }

                
                var jwtSettings = _config.GetSection("Jwt");
                var key = Encoding.UTF8.GetBytes(jwtSettings["Key"]);

                var claims = new[]
                {
                new Claim(ClaimTypes.Name, tokenData.Username),
                new Claim(ClaimTypes.Role, tokenData.Role)
                };

                // 3️⃣ Kreiraj token
                var tokenDescriptor = new SecurityTokenDescriptor
                {
                    Subject = new ClaimsIdentity(claims),
                    Expires = DateTime.UtcNow.AddMinutes(int.Parse(jwtSettings["ExpireMinutes"])),
                    Issuer = jwtSettings["Issuer"],
                    Audience = jwtSettings["Audience"],
                    SigningCredentials = new SigningCredentials(
                        new SymmetricSecurityKey(key),
                        SecurityAlgorithms.HmacSha256
                    )
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var token = tokenHandler.CreateToken(tokenDescriptor);
                var jwt = tokenHandler.WriteToken(token);

                // 4️⃣ Vrati token klijentu
                return Ok(new TokenResponse
                {
                    Token = jwt,
                    IsAuthenticated = true,
                    Username = tokenData.Username,
                    Role = tokenData.Role
                });

            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("EditAccount")]
        public async Task<IActionResult> EditAccount([FromBody] KorisnikDTO user)
        {
            try
            {
                var response = korisnikProvider.EditUser(user);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesno ste izmenili nalog");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpPut("EditPassword")]
        public async Task<IActionResult> EditPassword([FromBody] string username, string oldPassword, string newPassword)
        {
            try
            {
                var response = korisnikProvider.EditPassword(username, oldPassword, newPassword);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesno ste izmenili nalog");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpDelete("DeleteAccount")]
        public async Task<IActionResult> DeleteAccount([FromBody] string username)
        {
            try
            {
                var response = korisnikProvider.DeletetUser(username);
                if (response.Success == false)
                {
                    if (response.Message == "Odgovor baze") response.Message = "Vec postojeci username";
                    return BadRequest(response.Message);
                }
                return Ok("Uspesno ste obrisali nalog");
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }
    }
}
