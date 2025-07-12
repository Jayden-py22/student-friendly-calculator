using System.Net.NetworkInformation;
using Antlr.Runtime;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Calculator.Pages
{
    public class MassConverterModel : PageModel
    {
        private readonly ILogger<MassConverterModel> _logger;
        private double ConvertUnits(double value, string fromUnit, string toUnit)
        {
            if (fromUnit == toUnit)
                return value;

            // Mass conversions
            switch (fromUnit)
            {
                case "pound":
                    switch (toUnit)
                    {
                        case "gram": return value * 453.592;
                        case "kilogram": return value * 0.453592;
                        case "ton": return value * 0.000453592;
                        case "ounce": return value * 16;
                    }
                    break;

                case "gram":
                    switch (toUnit)
                    {
                        case "pound": return value / 453.592;
                        case "kilogram": return value / 1000;
                        case "ton": return value / 1_000_000;
                        case "ounce": return value / 28.3495;
                    }
                    break;

                case "kilogram":
                    switch (toUnit)
                    {
                        case "pound": return value / 0.453592;
                        case "gram": return value * 1000;
                        case "ton": return value / 1000;
                        case "ounce": return value * 35.274;
                    }
                    break;

                case "ton":
                    switch (toUnit)
                    {
                        case "pound": return value / 0.000453592;
                        case "gram": return value * 1_000_000;
                        case "kilogram": return value * 1000;
                        case "ounce": return value * 35274;
                    }
                    break;

                case "ounce":
                    switch (toUnit)
                    {
                        case "pound": return value / 16;
                        case "gram": return value * 28.3495;
                        case "kilogram": return value / 35.274;
                        case "ton": return value / 35274;
                    }
                    break;
            }

            throw new ArgumentException($"Unsupported conversion from '{fromUnit}' to '{toUnit}'.");
        }

        public MassConverterModel(ILogger<MassConverterModel> logger)
        {
            _logger = logger;
        }

        public void OnGet()
        {

        }

        public class ConversionRequest
        {
            public string FromUnit { get; set; }
            public string ToUnit { get; set; }
            public double Value { get; set; }
        }
        public IActionResult OnPostConverterSubmission([FromBody] ConversionRequest input)
        {
            try
            {
                double result = ConvertUnits(input.Value, input.FromUnit.ToLower(), input.ToUnit.ToLower());
                return new JsonResult(new { result });
            }
            catch (Exception ex)
            {
                return new JsonResult(new { error = ex.Message });
            }
        }

    }

}
