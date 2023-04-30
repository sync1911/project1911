def calculate_rate(numerator, denominator):
    return (numerator / denominator) * 100

def get_color(value, green_range, yellow_range):
    if value >= green_range[0] and value <= green_range[1]:
        return "green"
    elif value >= yellow_range[0] and value <= yellow_range[1]:
        return "yellow"
    else:
        return "red"

def analyze_metrics(metrics):
    rates = {
        "CTR": calculate_rate(metrics["Total Outbound Clicks"], metrics["Total Link Clicks"]),
        "Conversion Rate": calculate_rate(metrics["Total Sales"], metrics["Total Outbound Clicks"]),
        "VC to ATC": calculate_rate(metrics["Total Content Views"], metrics["Total Add to Cart"]),
        "ATC to ITC": calculate_rate(metrics["Total Add to Cart"], metrics["Total Initiate Checkouts"]),
        "ITC to PUR": calculate_rate(metrics["Total Initiate Checkouts"], metrics["Total Purchases"]),
        "QCP": calculate_rate(metrics["Total Outbound Clicks"], metrics["Total Link Clicks"])
    }

    colors = {
        "CTR": get_color(rates["CTR"], (2, 100), (1, 2)),
        "Conversion Rate": get_color(rates["Conversion Rate"], (2, 100), (1, 2)),
        "VC to ATC": get_color(rates["VC to ATC"], (25, 100), (10, 25)),
        "ATC to ITC": get_color(rates["ATC to ITC"], (30, 100), (15, 30)),
        "ITC to PUR": get_color(rates["ITC to PUR"], (45, 100), (20, 45)),
        "QCP": get_color(rates["QCP"], (80, 100), (60, 80))
    }

    return rates, colors
