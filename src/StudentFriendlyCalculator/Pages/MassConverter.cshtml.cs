using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Extensions.Logging;

namespace StudentFriendlyCalculator.Pages;

[IgnoreAntiforgeryToken]
public class MassConverterModel : PageModel
{
    private readonly ILogger<MassConverterModel> _logger;

    public MassConverterModel(ILogger<MassConverterModel> logger)
    {
        _logger = logger;
    }

    public IActionResult OnPostConvert([FromForm] string FromUnit, [FromForm] string ToUnit, [FromForm] double Value)
    {
        try
        {
            var result = ConvertUnits(Value, FromUnit.ToLower(), ToUnit.ToLower());
            return new JsonResult(new { result });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Conversion failed");
            return new JsonResult(new { error = "Conversion error: " + ex.Message });
        }
    }

    private double ConvertUnits(double value, string from, string to)
    {
        if (from == to) return value;

        var conversions = new Dictionary<(string, string), double>
        {
            { ("pound", "gram"), 453.592 }, { ("pound", "kilogram"), 0.453592 }, { ("pound", "ton"), 0.000453592 }, { ("pound", "ounce"), 16 },
            { ("gram", "pound"), 1 / 453.592 }, { ("gram", "kilogram"), 1 / 1000 }, { ("gram", "ton"), 1 / 1_000_000 }, { ("gram", "ounce"), 1 / 28.3495 },
            { ("kilogram", "pound"), 1 / 0.453592 }, { ("kilogram", "gram"), 1000 }, { ("kilogram", "ton"), 1 / 1000 }, { ("kilogram", "ounce"), 35.274 },
            { ("ton", "pound"), 1 / 0.000453592 }, { ("ton", "gram"), 1_000_000 }, { ("ton", "kilogram"), 1000 }, { ("ton", "ounce"), 35274 },
            { ("ounce", "pound"), 1 / 16 }, { ("ounce", "gram"), 28.3495 }, { ("ounce", "kilogram"), 1 / 35.274 }, { ("ounce", "ton"), 1 / 35274 }
        };

        if (conversions.TryGetValue((from, to), out var factor))
            return value * factor;

        throw new ArgumentException($"Unsupported conversion: {from} to {to}");
    }
}