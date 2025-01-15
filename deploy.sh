#!/usr/bin/sh

#Get current version
current_tag=$(head -n 1 "changelogs.txt")

# Extract the prefix (everything except the last digit) and the last digit
prefix=${current_tag%.*}
last_digit=${current_tag##*.}

# Increment the last digit
new_last_digit=$((last_digit + 1))
new_version="${prefix}.${new_last_digit}"

# Remove new version's tag if exist
git push origin --delete $new_version
git push public --delete $new_version
git tag -d $new_version

# Get all commits in reverse order (oldest to newest) with tags
commits_with_tags=$(git log --reverse --pretty=format:"%H %s" --tags --decorate=short)

# Initialize the output file and empty the file
output_file="changelogs.txt"
temp_file="temp.txt"

cp "$output_file" "$temp_file"

> "$output_file"

# Variables to track the current and next tags
current_tag_iteration=""
next_tag=""

#Set New Tag
git tag $new_version

# Get all tags sorted by commit date
tags=($(git tag --sort=committerdate))

# Iterate over all commits from newest to oldest
for commit in $(git rev-list HEAD); do
    # Check if the commit has a tag
    tag=$(git tag --points-at "$commit")

    if [[ -n $tag ]]; then #Has a Tag
        # Skip the iteration if the tag is already in the changelogs
        # if grep -q "^$tag\$" "$output_file"; then
        #     continue
        # fi

        # Update the current tag and add it to the file
        current_tag_iteration=$tag

        if [[ "$current_tag_iteration" == "$current_tag" ]]; then
            break
        fi

        echo "$current_tag_iteration" >> "$output_file"

        # Add the commit message for the tagged commit
        commit_message=$(git log -1 --pretty=format:"    - %s" "$commit")
        echo "$commit_message" >> "$output_file"
    else #Does not have a Tag
        # Commit is untagged; treat it as part of the nearest lower tag
        if [[ -n $current_tag_iteration ]]; then
            # Add the commit message under the current tag
            commit_message=$(git log -1 --pretty=format:"    - %s" "$commit")
            
            #Skip Auto changelogs commit
            if [[ "$commit_message" == "    - auto-changelogs" || "$commit_message" == "    - Update changelogs" ]]; then
                continue
            fi

            echo "$commit_message" >> "$output_file"
        fi
    fi
done

{ cat "$output_file"; cat "$temp_file"; } > new_file.txt && mv new_file.txt "$output_file"

rm -f "$temp_file"


# Update changelogs
git add .
git commit -m "auto-changelogs"
git push origin
git push origin --tags
git push public
git push public --tags

docker build -t container.banksulutgo.co.id:5000/qris-merchant-pub:$new_version .

docker push container.banksulutgo.co.id:5000/qris-merchant-pub:$new_version
