import csv
import sys

CLOSE_IND = 4
DATE_IND = 0


def main(argv):
    max_benefits, max_buy_count, mean_list = N_benefits(int(argv[0]), argv[1])
    # print('list: ', mean_list)

    writeCSV(mean_list, argv[0] + '_' + argv[1])

def N_benefits(n, filename):
    with open(filename, newline='') as f:
        reader = csv.reader(f)
        data = []
        for row in reader:
            data.append(row)

        n_mean = []
        # Initialize n_mean with the n first elements
        for i in range(1, n + 1):
            n_mean.append(float(data[i][CLOSE_IND]))

        state = 'waiting'
        last_close_buy = 0.0
        benefits = 0.0
        counter = 0
        mean_list = []
        for i in reversed(range(n, len(data) - 1)): # Start at n+1 element
            close = float(data[i][CLOSE_IND])
            next_day_close = float(data[i + 1][CLOSE_IND])
            mean = sum(n_mean) / n
            mean_list.append((data[i][DATE_IND], mean))
            # if (data[i][0] == '2017-02-10'): # For debug
            #    print(state, mean, close)
            #    print(n_mean)
            if (state == 'waiting' and close > mean):
                if(next_day_close >= mean):
                    counter += 1
                    state = 'buy'
                    last_close_buy = next_day_close
                    benefits -= next_day_close * float(0.002)

            elif(state == 'buy' and close < mean):
                try:
                    benefits += next_day_close - last_close_buy
                except Exception as e:
                    print('sell last day')
                state = 'waiting'
                last_close_buy = 0.0
            n_mean.pop(0)
            n_mean.append(close)
        return benefits, counter, mean_list


def writeCSV(data, filename):
    with open(filename, "w", newline='') as f:
        writer = csv.writer(f, delimiter=',')
        writer.writerows(data)


if __name__ == "__main__":
    main(sys.argv[1:])
