using System.Text;

namespace Cinema.Controllers.DTO
{
    public class Tools
    {
        public static string TransliterateToAscii(string input)
        {
            if (string.IsNullOrEmpty(input))
                return input;

            var replacements = new Dictionary<char, char>
    {
        { 'č', 'c' }, { 'ć', 'c' }, { 'ž', 'z' },
        { 'š', 's' }, { 'đ', 'd' }, { 'Č', 'C' },
        { 'Ć', 'C' }, { 'Ž', 'Z' }, { 'Š', 'S' },
        { 'Đ', 'D' }
    };

            var result = new StringBuilder(input.Length);

            foreach (var ch in input)
            {
                if (replacements.ContainsKey(ch))
                    result.Append(replacements[ch]);
                else
                    result.Append(ch);
            }

            return result.ToString();
        }

        public static string removeSpace(string str)
        {
            var result = new StringBuilder(str.Length);
            foreach (var ch in str)
            {
                if (ch == ' ')
                    result.Append('_');
                else
                    result.Append(ch);
            }
            return result.ToString();
        }
    }
}
